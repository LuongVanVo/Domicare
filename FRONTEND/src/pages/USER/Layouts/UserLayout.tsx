import { Outlet } from 'react-router-dom'
import UserSideNav from './UserSideNav'

export default function UserLayout() {
  return (
    <section className=' bg-bg py-4 md:mt-20'>
      <div className='max-w-7xl p-4  mx-auto '>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 md:col-span-3 lg:col-span-2'>
            <UserSideNav />
          </div>
          <div className='col-span-12 md:col-span-9 lg:col-span-10 '>
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  )
}
