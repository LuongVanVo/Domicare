import { Archive, LayoutDashboard, LucideProps } from 'lucide-react'
import { path } from './path'
import { ChartNoAxesCombined, Bot, Users, Settings } from 'lucide-react'
import { getUserFromLocalStorage } from '@/utils/storage'

export interface SidebarItem {
  title: string
  url: string
  isActive?: boolean
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>
  items?: ItemChild[]
}
export type ItemChild = {
  title: string
  url: string
}

export interface Sidebar {
  ROLE_ADMIN: SidebarItem[]
  ROLE_SALE: SidebarItem[]
}

import { useTranslation } from 'react-i18next'

export const useSidebarItems = (): Sidebar => {
  const { t } = useTranslation('admin') // dùng đúng namespace

  const createSaleOrderUrl = () => {
    const user = getUserFromLocalStorage()
    if (!user?.id) return path.admin.booking
    return `${path.admin.booking}?saleId=${user.id}`
  }

  return {
    ROLE_ADMIN: [
      {
        title: t('sidebar.dashboard'),
        url: path.admin.dashboard,
        icon: ChartNoAxesCombined
      },
      {
        title: t('sidebar.manage_order'),
        url: path.admin.booking,
        icon: LayoutDashboard
      },
      {
        title: t('sidebar.manage_user'),
        url: path.admin.manage.sale,
        icon: Users,
        isActive: true,
        items: [
          { title: t('sidebar.sale'), url: path.admin.manage.sale },
          { title: t('sidebar.customer'), url: path.admin.manage.user }
        ]
      },
      {
        title: t('sidebar.manage_system'),
        url: path.admin.manage.category,
        icon: Bot,
        isActive: true,
        items: [
          { title: t('sidebar.category'), url: path.admin.manage.category },
          { title: t('sidebar.service'), url: path.admin.manage.product },
          { title: t('sidebar.post'), url: path.admin.manage.post }
        ]
      },
      {
        title: t('sidebar.settings'),
        url: path.admin.setting.profile,
        icon: Settings,
        isActive: true,
        items: [
          { title: t('sidebar.profile'), url: path.admin.setting.profile },
          { title: t('sidebar.system'), url: path.admin.setting.system }
        ]
      }
    ],
    ROLE_SALE: [
      {
        title: t('sidebar.dashboard'),
        url: path.admin.dashboard,
        icon: ChartNoAxesCombined
      },
      {
        title: t('sidebar.all_order'),
        url: path.admin.booking,
        icon: LayoutDashboard
      },
      {
        title: t('sidebar.my_order'),
        url: createSaleOrderUrl(),
        icon: Archive
      },
      {
        title: t('sidebar.settings'),
        url: path.admin.setting.profile,
        icon: Settings,
        isActive: true,
        items: [
          { title: t('sidebar.profile'), url: path.admin.setting.profile },
          { title: t('sidebar.system'), url: path.admin.setting.system }
        ]
      }
    ]
  }
}
