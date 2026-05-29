import { useTranslation } from 'react-i18next'
import { path } from './path'

export const breadcrumbKeys = [
  'admin',
  'booking',
  'dashboard',
  'user',
  'category',
  'product',
  'profile',
  'setting',
  'sale',
  'manage',
  'system',
  'coming_soon',
  'post'
] as const

export type BreadcrumbKey = (typeof breadcrumbKeys)[number]

/**
 * Hook trả về breadcrumb config động theo ngôn ngữ hiện tại
 */
export const useBreadcrumbConfig = () => {
  const { t } = useTranslation(['admin', 'common'])

  return {
    admin: {
      label: t('admin:sidebar.manage_system'),
      href: path.admin.dashboard
    },
    booking: {
      label: t('admin:sidebar.manage_order'),
      href: path.admin.booking
    },
    dashboard: {
      label: t('admin:sidebar.dashboard'),
      href: path.admin.dashboard
    },
    user: {
      label: t('admin:sidebar.customer'),
      href: path.admin.manage.user
    },
    category: {
      label: t('admin:sidebar.category'),
      href: path.admin.manage.category
    },
    product: {
      label: t('admin:sidebar.service'),
      href: path.admin.manage.product
    },
    profile: {
      label: t('admin:sidebar.profile'),
      href: path.admin.setting.profile
    },
    setting: {
      label: t('admin:sidebar.settings'),
      href: path.admin._setting
    },
    sale: {
      label: t('admin:sidebar.sale'),
      href: path.admin.manage.sale
    },
    manage: {
      label: t('admin:sidebar.manage_system'),
      href: path.admin._manage
    },
    system: {
      label: t('admin:sidebar.system'),
      href: path.admin.setting.system
    },
    coming_soon: {
      label: t('common:coming_soon'),
      href: path.admin.coming_soon
    },
    post: {
      label: t('admin:sidebar.post'),
      href: path.admin.manage.post
    }
  } as const
}
