import { useEffect, useRef, useState } from 'react'

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
  const stompClient = useRef<any>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only run on client-side (not during SSR)
    if (typeof window === 'undefined') {
      return
    }

    // Dynamic import để tránh load trên server
    let client: any = null

    const initWebSocket = async () => {
      if (!config.url || !config.topics || Object.keys(config.topics).length === 0) {
        setIsConnected(false)
        return
      }

      if (stompClient.current) {
        stompClient.current.deactivate()
        stompClient.current = null
      }

      try {
        const [{ Client }, { default: SockJS }] = await Promise.all([import('@stomp/stompjs'), import('sockjs-client')])

        client = new Client({
          webSocketFactory: () => new SockJS(config.url),
          reconnectDelay: 5000,
          onConnect: () => {
            setIsConnected(true)
            Object.entries(config.topics).forEach(([topic, callback]) => {
              client.subscribe(topic, (message: any) => {
                const data = JSON.parse(message.body)
                callback(data)
              })
            })

            config.onConnect?.()
          },
          onDisconnect: () => {
            setIsConnected(false)
            config.onDisconnect?.()
          },
          onStompError: (frame: any) => {
            setIsConnected(false)
            config.onError?.(frame)
          }
        })

        stompClient.current = client
        client.activate()
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setIsConnected(false)
      }
    }

    initWebSocket()

    return () => {
      // Cleanup on unmount or dependency change
      if (stompClient.current) {
        stompClient.current.deactivate()
        stompClient.current = null
        setIsConnected(false)
      }
    }
  }, [config])

  return {
    isConnected: isConnected
  }
}
