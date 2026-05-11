import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

import { Category } from '@/models/interface/category.interface'
import useDialogState from '@/hooks/useDialogState'
import { CategoryDialogType } from '@/configs/consts'

interface CategoryContextType {
  open: CategoryDialogType | null
  setOpen: (str: CategoryDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: Dispatch<SetStateAction<Category | null>>
}

const CategoryContext = createContext<CategoryContextType | null>(null)

interface Props {
  children: ReactNode
}

export default function CategoryProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)

  return (
    <CategoryContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</CategoryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCategories = () => {
  const CateContext = useContext(CategoryContext)
  if (!CateContext) {
    throw new Error('Something went wrong!')
  }

  return CateContext
}
