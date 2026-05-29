import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

import useDialogState from '@/hooks/useDialogState'
import { ProductDialogType } from '@/configs/consts'
import { Product } from '@/models/interface/product.interface'

interface ProductContextType {
  open: ProductDialogType | null
  setOpen: (str: ProductDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: Dispatch<SetStateAction<Product | null>>
}

const ProductContext = createContext<ProductContextType | null>(null)

interface Props {
  children: ReactNode
}

export default function ProductProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProductDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  return (
    <ProductContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</ProductContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const prdContext = useContext(ProductContext)

  if (!prdContext) {
    throw new Error('Something went wrong!')
  }

  return prdContext
}
