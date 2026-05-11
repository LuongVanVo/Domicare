import { AppSidebar } from './AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from './Header'
import AnimatedOutlet from '@/components/AnimatedOutlet'
import Helmet from '@/components/Helmet/Helmet'

const LayoutMain = () => {
  return (
    <SidebarProvider>
      <Helmet />
      <AppSidebar />
      <SidebarInset>
        <main className='flex-1 overflow-auto bg-admin-bg'>
          <Header />
          <div className='px-4'>
            <AnimatedOutlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default LayoutMain
