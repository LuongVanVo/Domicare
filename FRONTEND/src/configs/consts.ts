import { BookingStatus } from '@/models/interface/booking.interface'
import { ROLE_TYPE } from '@/models/types/user.type'
import dayjs from 'dayjs'
import i18next from 'i18next'

/**
 * Date-time constants
 */
export const STANDARD_DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}?$/
export const STANDARD_TIME_REGEX = /^[0-9]{2}:[0-9]{2}?$/
export const STANDARD_DATE_TIME_REGEX_WITHOUT_TIMEZONE =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}[\sT][0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?$/
export const STANDARD_DATE_TIME_REGEX =
  /^([0-9]{4}-[0-9]{2}-[0-9]{2})[\sT]([0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?)(Z|[+-][0-9]{2}:[0-9]{2})?$/
export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD'
export const STANDARD_DATE_FORMAT_INVERSE = 'DD-MM-YYYY'
export const STANDARD_DATE_FORMAT_US = 'MM-DD-YYYY'
export const STANDARD_DATE_FORMAT_SLASH = 'DD/MM/YYYY'
export const STANDARD_DATE_FORMAT_COMPACT = 'DDMMYYYY'
export const STANDARD_DATE_FORMAT_FULL = 'DD/MM/YYYY HH:mm'
export const STANDARD_DATE_FORMAT_FULL_TIME = 'DD-MM-YYYY HH:mm:ss'
export const VIETNAMESE_TIME_ZONE_OFFSET = 7
export const STANDARD_TIME_FORMAT = 'HH:mm:ss'
export const STANDARD_TIME_FORMAT_MM_YYYY = 'MM/YYYY'
export const STANDARD_TIME_FORMAT_MM_YYYY_INVERSE = 'MM-YYYY'
export const DEFAULT_DATETIME_VALUE = '0001-01-01T00:00:00'
export const STANDARD_DATE_TIME_FORMAT = `${STANDARD_DATE_FORMAT}${'T' + STANDARD_TIME_FORMAT + 'Z'}`
export const STANDARD_DATE_TIME_FORMAT_VIEW = `${STANDARD_DATE_FORMAT_INVERSE} ${STANDARD_TIME_FORMAT}`
export const TIMEZONE_OFFSET: string = dayjs().format('Z')
export const NAME_BANK_REGEX = /^[^\t\n"']*$/
export const ACCOUNT_BANK_REGEX = /^[a-zA-Z0-9]*$/
export const PHONE_NUMBER_REGEX = /^[0-9\s()+-]*$/
export const DESCRIPTION_REGEX = /^[^\t\n]*$/
export const CHARACTER_TAB_REGEX = /\s{2,}/
export const SUPPLIER_TAX_CODE_REGEX = /^([A-Za-z0-9\-_&]*)$/
export const NOT_TAB_ENTER_REGEX = /^[^\t\r\n]*$/
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const NOT_SPECIAL_CHARACTERS = /^[a-zA-Z0-9À-ỹ\s]*$/

/**
 * Debounce time constants
 */
export const DEBOUNCE_TIME_100 = 100

export const DEBOUNCE_TIME_150 = 150

export const DEBOUNCE_TIME_200 = 200

export const DEBOUNCE_TIME_250 = 250

export const DEBOUNCE_TIME_300 = 300

export const DEBOUNCE_TIME_350 = 350

export const DEBOUNCE_TIME_400 = 400

export const INPUT_DEBOUNCE_TIME = 400

/**
 * limit constants
 */
export const DEFAULT_LIMIT_WORD = 50
export const NOTIFICATION_LIMIT_WORD = 75
export const DEFAULT_PAGE_SIZE_OPTION = [10, 20, 30, 40, 50]

/**
 * Filter constants
 */
// export const DEFAULT_TAKE = 10;
export const DEFAULT_PAGE_SIZE = 10

export const DEFAULT_PAGE_SIZE_30 = 30

export const SPECIAL_CHARACTERS =
  /[ `!@#$%^&*()_+\-=[\]{};':"|,.<>/?~ẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴắằẳẵặăấầẩẫậâáàãảạđếềểễệêéèẻẽẹíìỉĩịốồổỗộôớờởỡợơóòõỏọứừửữựưúùủũụýỳỷỹỵ]/

/**
 * url constants
 */

export const ACTION_URL_REGEX = /^(\/?rpc)/

/**
 * string empty constants
 */

export const EMPTY_STRING = '---'

/**
 * route constants
 */
export const ROOT_ROUTE: string = import.meta.env.BASE_URL

/**
 * size modal constants
 */

export const TIME_FORMAT = 'HH:mm'
// type day
export const DAY_TYPE = 'day'

export const DATE_PLACEHOLDER = STANDARD_DATE_FORMAT_SLASH.toLowerCase()

// config role
export const ROLES: Record<string, ROLE_TYPE> = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  SALE: 'ROLE_SALE'
}
export const ROLE_SALE_CODE = 3
export const ROLE_ADMIN = 'ROLE_ADMIN'
export const ROLE_USER = 'ROLE_USER'
export const ROLE_SALE = 'ROLE_SALE'

// config type text
export const TEXT_TYPE = 'text'
export const NUMBER_TYPE = 'number'
export const PASSWORD_TYPE = 'password'

//config gender
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
}

//config status
export const ADMIN_STATUS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete'
}
export type CategoryDialogType = 'add' | 'edit' | 'delete'
export type ProductDialogType = 'add' | 'edit' | 'delete'
export type UserDialogType = 'add' | 'edit' | 'delete'
export type BookingDialogType = 'add' | 'edit' | 'delete'
// config time
export const STATE_TIME = 60 * 1000 * 3

export const DEFAULT_DATE_OF_BIRTH = '2000-01-01'

// config role id
export const ROLE_ID = {
  ADMIN: 2,
  USER: 1,
  SALE: 3
}

export const UPLOAD_STATUS = {
  COLOR: {
    PROCESS: 'bg-blue-500',
    DONE: 'bg-green-500',
    ERROR: 'bg-red-500'
  }
}

export const ACTIVE_STATUS_USER = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Chưa kích hoạt'
}
export const VND_CURRENCY_UNIT = 'VND'

export const statusLabels = {
  [BookingStatus.PENDING]: 'Chờ xác nhận',
  [BookingStatus.REJECTED]: 'Bị từ chối',
  [BookingStatus.SUCCESS]: 'Thành công',
  [BookingStatus.FAILED]: 'Thất bại',
  [BookingStatus.ACCEPTED]: 'Đang tư vấn',
  [BookingStatus.CANCELLED]: 'Đã hủy'
}
export const statusColors = {
  [BookingStatus.PENDING]: '#FFA000',
  [BookingStatus.REJECTED]: '#F57C00',
  [BookingStatus.SUCCESS]: '#2E7D32',
  [BookingStatus.FAILED]: '#C62828',
  [BookingStatus.ACCEPTED]: '#1565C0',
  [BookingStatus.CANCELLED]: '#C62828'
}

export const languagesDefault = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' }
]

export const getBookingStatusList = () => [
  { label: i18next.t('product:booking_status.pending'), value: BookingStatus.PENDING },
  { label: i18next.t('product:booking_status.accepted'), value: BookingStatus.ACCEPTED },
  { label: i18next.t('product:booking_status.success'), value: BookingStatus.SUCCESS },
  { label: i18next.t('product:booking_status.failed'), value: BookingStatus.FAILED },
  { label: i18next.t('product:booking_status.rejected'), value: BookingStatus.REJECTED }
]

export const getBookingStatusExtra = () => [
  { label: i18next.t('product:booking_status.all'), value: BookingStatus.ALL },
  ...getBookingStatusList(),
  { label: i18next.t('product:booking_status.cancelled'), value: BookingStatus.CANCELLED }
]

// Helper function để lấy label từ value
export const getBookingStatusLabel = (status: BookingStatus) => {
  return i18next.t(`product:booking_status.${status.toLowerCase()}`)
}
