import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar'
import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { AppContext } from '@/core/contexts/app.context'
import { rolesCheck } from '@/utils/rolesCheck'
import LogoSideNav from '@/components/LogoSideNav'
import { useSidebarItems } from '@/core/constants/sidebar.const'
import { ComponentProps, useContext } from 'react'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { profile } = useContext(AppContext)
  const isAdmin = rolesCheck.isAdmin(profile?.roles || [])
  const initialSideBar = useSidebarItems()
  // fixx
  const sidebar = isAdmin ? initialSideBar.ROLE_ADMIN : initialSideBar.ROLE_SALE
  const { open } = useSidebar()
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>{open ? <LogoSideNav /> : null}</SidebarHeader>
      <SidebarContent>
        <NavMain data={sidebar} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile || undefined} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
