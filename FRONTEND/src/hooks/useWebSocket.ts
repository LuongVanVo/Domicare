import { useEffect, useRef, useState, useContext } from 'react'
import { getAccessTokenFromLS } from '@/utils/storage'
import { AppContext } from '@/core/contexts/app.context'

interface WebSocketConfig {
  url: string
  topics: {
    [key: string]: (message: any) => void
  }
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

export const useWebSocket = (config: WebSocketConfig) => {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeoutRef = useRef<any>(null)
  const { isAuthenticated } = useContext(AppContext)

  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? getAccessTokenFromLS() : null
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleTokenChanged = (event: Event) => {
      const customEvent = event as CustomEvent<string | null>
      setToken(customEvent.detail)
    }

    window.addEventListener('auth:token-changed', handleTokenChanged)
    return () => {
      window.removeEventListener('auth:token-changed', handleTokenChanged)
    }
  }, [])
  // Use refs for callbacks and topics to prevent triggering reconnects when they change references
  const topicsRef = useRef(config.topics)
  const onConnectRef = useRef(config.onConnect)
  const onDisconnectRef = useRef(config.onDisconnect)
  const onErrorRef = useRef(config.onError)

  useEffect(() => {
    topicsRef.current = config.topics
    onConnectRef.current = config.onConnect
    onDisconnectRef.current = config.onDisconnect
    onErrorRef.current = config.onError
  }, [config])

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return
    }

    if (!config.url || !token || !isAuthenticated) {
      setIsConnected(false)
      return
    }

    const connect = () => {
      try {
        // Convert http/https to ws/wss
        const wsUrl = config.url.replace(/^http/, 'ws') + `?token=${token}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          onConnectRef.current?.()
        }

        ws.onclose = () => {
          setIsConnected(false)
          onDisconnectRef.current?.()
          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 5000)
        }

        ws.onerror = (error) => {
          setIsConnected(false)
          onErrorRef.current?.(error)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            const msgType = message.type
            const msgData = message.data

            if (msgType === 'booking_notification') {
              const action = message.action // 'new' or 'update'
              Object.entries(topicsRef.current).forEach(([topic, callback]) => {
                if (action === 'new' && topic.includes('/bookings/new')) {
                  callback(msgData)
                } else if (action === 'update' && topic.includes('/bookings/update')) {
                  callback(msgData)
                }
              })
            } else if (msgType === 'chat_message') {
              Object.entries(topicsRef.current).forEach(([topic, callback]) => {
                if (topic === 'chat_message' || topic.includes('chat')) {
                  callback(msgData)
                }
              })
            } else if (msgType === 'chat_message_delete') {
              Object.entries(topicsRef.current).forEach(([topic, callback]) => {
                if (topic === 'chat_message_delete' || topic.includes('delete')) {
                  callback(msgData)
                }
              })
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e)
          }
        }
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.onclose = null // Prevents reconnect loop on unmount
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
    }
  }, [config.url, token, isAuthenticated]) // Reconnect if connection URL, token, or auth state changes

  const sendMessage = (action: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...payload }))
    } else {
      console.warn('WebSocket is not open. Message not sent:', action, payload)
    }
  }

  return {
    isConnected,
    sendMessage
  }
}
