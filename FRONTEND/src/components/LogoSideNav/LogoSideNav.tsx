import { logoDomicare } from '@/assets/images'
import { path } from '@/core/constants/path'

import { Link } from 'react-router-dom'

export default function LogoSideNav() {
  return (
    <div data-slot='sidebar-menu-button' data-sidebar='menu-button' data-active={false} className={' mx-auto '}>
      <Link to={path.admin.dashboard}>
        <img src={logoDomicare} className='w-sm h-20' alt='DomiCare' />
      </Link>
    </div>
  )
}
