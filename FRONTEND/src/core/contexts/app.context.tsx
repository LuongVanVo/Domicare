import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

import { User } from '@/models/interface/user.interface'
import { Category } from '@/models/interface/category.interface'
// import { initialSideBar, Sidebar } from '../constants/sidebar.const'
import { useCategoryQuery } from '../queries/product.query'
import {
  getAccessTokenFromLS,
  getCategoriesFromLocalStorage,
  getUserFromLocalStorage,
  setCateToLS,
  setUserToLS
} from '@/utils/storage'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>
  profile: User | null
  setProfile: Dispatch<SetStateAction<User | null>>
  categories: Category[] | null
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>
}

const initialAppContext: AppContextInterface = {
  isAuthenticated: false,
  setIsAuthenticated: () => null,
  profile: null,
  setProfile: () => null,
  categories: null,
  setCategories: () => null
}

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[] | null>(null)

  const { data } = useCategoryQuery({ queryString: undefined })

  // Initialize from localStorage/cookies on client side only
  useEffect(() => {
    const token = getAccessTokenFromLS()
    setIsAuthenticated(Boolean(token))

    const storedProfile = getUserFromLocalStorage()
    if (storedProfile) {
      setProfile(storedProfile)
    }

    const storedCategories = getCategoriesFromLocalStorage()
    if (storedCategories) {
      setCategories(storedCategories)
    }
  }, [])

  // Sync profile to localStorage when it changes
  useEffect(() => {
    if (profile) {
      setUserToLS(profile)
    }
  }, [profile])

  // Sync categories from API
  useEffect(() => {
    const dataCategory = (data && data.data.data.data) || []
    if (dataCategory.length > 0) {
      setCategories(dataCategory)
      setCateToLS(dataCategory)
    }
  }, [data])

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        categories,
        setCategories
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
