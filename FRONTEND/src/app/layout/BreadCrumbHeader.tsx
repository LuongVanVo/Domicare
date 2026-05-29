import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useBreadcrumbConfig, BreadcrumbKey } from '@/core/constants/breadcrumb.const'
import { Link, useLocation } from 'react-router-dom'
import { path } from '@/core/constants/path'

interface BreadcrumbItemType {
  label: string
  href?: string
}

export function BreadcrumbHeader() {
  const { pathname } = useLocation()
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbConfig = useBreadcrumbConfig()
  const breadcrumbs: BreadcrumbItemType[] = pathSegments.map((item: string, idx: number) => {
    if (item === 'sale' && idx === 0) {
      return {
        label: breadcrumbConfig.dashboard.label,
        href: path.sale.dashboard
      }
    }
    const config = breadcrumbConfig[item as BreadcrumbKey]
    if (config) {
      return {
        label: config.label,
        href: config.href
      }
    }
    return {
      label: item,
      href: undefined
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item: BreadcrumbItemType, index: number) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <div key={index} className='flex items-center'>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbItem>
                  <BreadcrumbPage className='text-base md:text-lg'>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  {item.href ? (
                    <Link to={item.href} className='text-base md:text-lg text-muted-foreground hover:underline'>
                      {item.label}
                    </Link>
                  ) : (
                    <span className='text-base md:text-lg text-muted-foreground'>{item.label}</span>
                  )}
                </BreadcrumbItem>
              )}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
