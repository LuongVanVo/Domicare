import { Sidebar } from '@/core/constants/sidebar.const'
import { Category } from '@/models/interface/category.interface'
import { User } from '@/models/interface/user.interface'
import Cookies from 'js-cookie'

export const LocalStorageEventTarget = new EventTarget()

const isBrowser = typeof window !== 'undefined'

export const setAccessTokenToLS = (token: string) => {
  Cookies.set('access_token', token, {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'strict'
  })
}

export const setRefreshTokenToLS = (token: string) => {
  Cookies.set('refresh_token', token, {
    expires: 30, // 30 days
    secure: true,
    sameSite: 'strict'
  })
}

export const getAccessTokenFromLS = (): string => {
  return Cookies.get('access_token') || ''
}

export const getRefreshTokenFromLS = (): string => {
  return Cookies.get('refresh_token') || ''
}

export const removeAccessTokenFromLS = () => {
  Cookies.remove('access_token')
}

export const removeRefreshTokenFromLS = () => {
  Cookies.remove('refresh_token')
}

export const setUserToLS = (user: User) => {
  if (isBrowser) {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export const getUserFromLocalStorage = (): User | null => {
  if (!isBrowser) return null
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

export const setCateToLS = (category: Category[]) => {
  if (isBrowser) {
    localStorage.setItem('category', JSON.stringify(category))
  }
}

export const getCategoriesFromLocalStorage = (): Category[] | null => {
  if (!isBrowser) return null
  try {
    const category = localStorage.getItem('category')
    return category ? JSON.parse(category) : null
  } catch (error) {
    console.error('Error parsing categories from localStorage:', error)
    return null
  }
}

export const setSidebarToLS = (sidebar: Sidebar) => {
  if (isBrowser) {
    localStorage.setItem('sidebar', JSON.stringify(sidebar))
  }
}

export const getSideBarFromLS = (): Sidebar | null => {
  if (!isBrowser) return null
  try {
    const sidebar = localStorage.getItem('sidebar')
    return sidebar ? JSON.parse(sidebar) : null
  } catch (error) {
    console.error('Error parsing sidebar from localStorage:', error)
    return null
  }
}

export const removeSidebarFromLS = () => {
  if (isBrowser) {
    localStorage.removeItem('sidebar')
  }
}

export const setOpenSidebarToLS = (isOpen: boolean) => {
  if (isBrowser) {
    localStorage.setItem('isOpen', JSON.stringify(isOpen))
  }
}

export const getOpenSidebarFromLS = (): boolean => {
  if (!isBrowser) return true
  try {
    const isOpen = localStorage.getItem('isOpen')
    return isOpen ? JSON.parse(isOpen) : true
  } catch (error) {
    console.error('Error parsing sidebar open state from localStorage:', error)
    return true
  }
}

export const clearLS = () => {
  // Clear cookies (tokens)
  removeAccessTokenFromLS()
  removeRefreshTokenFromLS()

  if (isBrowser) {
    localStorage.removeItem('category')
    localStorage.removeItem('user')
    localStorage.removeItem('sidebar')
    localStorage.removeItem('isOpen')
  }

  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}
