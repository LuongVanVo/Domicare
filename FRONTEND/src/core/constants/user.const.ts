import { GENDER_TYPE } from '@/models/types/user.type'

interface genderType {
  male: GENDER_TYPE
  female: GENDER_TYPE
  other: GENDER_TYPE
}
export const gender: genderType = {
  male: 'MALE',
  female: 'FEMALE',
  other: 'OTHER'
}
