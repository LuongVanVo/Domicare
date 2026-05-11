import { LoginType } from './login.type'
import { GENDER_TYPE } from './user.type'

export type RegisterType = LoginType & {
  confirmPassword: string
  name?: string
  phone?: string
  address?: string
  avatar?: string
  gender?: GENDER_TYPE
  dateOfBirth?: string
}
