import { User } from './user.interface'

// define the Login interface
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type?: string
  user?: User
}
export interface SentEmailResponse {
  email?: string
  message?: string
  token?: string
}

// define the RegisterReponse interface
export interface RegisterReponse {
  id?: number
  email?: string
  full_name?: string
  message?: string
  is_email_confirmed?: boolean
}
