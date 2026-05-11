import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'
import { UserDialogType } from '@/configs/consts'
import { User } from '@/models/interface/user.interface'
import useDialogState from '@/hooks/useDialogState'

interface UserContextType {
  open: UserDialogType | null
  setOpen: (str: UserDialogType | null) => void
  currentRow: User | null
  setCurrentRow: Dispatch<SetStateAction<User | null>>
}

const UserContext = createContext<UserContextType | null>(null)
interface Props {
  children: ReactNode
}
export function UserProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UserDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return <UserContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</UserContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}
