import { Navigate, Outlet, RouteObject, useLocation, useRoutes } from 'react-router-dom'
import { Fragment, lazy, ReactNode, useContext, Suspense } from 'react'
import { rolesCheck } from '@/utils/rolesCheck'
import { path } from '@/core/constants/path'
import { AppContext } from '@/core/contexts/app.context'
import { CleanLoading } from '@/assets/videos'
const ComingSoon = lazy(() => import('@/pages/ADMIN/CommingSoon/CommingSoon'))
// Lazy load all components
const LayoutMain = lazy(() => import('@/app/layout/LayoutMain'))
const Login = lazy(() => import('@/pages/ALL/Login'))
const Register = lazy(() => import('@/pages/ALL/Register'))
const PageNotFound = lazy(() => import('@/pages/ALL/404/PageNotFound'))
const CustomerLayout = lazy(() => import('@/app/layout/CustomerLayout'))
const Products = lazy(() => import('@/pages/ALL/Products'))
const ProfileAdmin = lazy(() => import('@/pages/ADMIN/Settings/components/Profile.setting'))
const Category = lazy(() => import('@/pages/ADMIN/Manage/Category.manage'))
const Product = lazy(() => import('@/pages/ADMIN/Manage/Product.manage'))
const Sale = lazy(() => import('@/pages/ADMIN/Manage/Sale.manage'))
const User = lazy(() => import('@/pages/ADMIN/Manage/User.manage'))
const ProductDetail = lazy(() => import('@/pages/ALL/ProductDetail'))
const Setting = lazy(() => import('@/pages/ADMIN/Settings'))
const SystemSetting = lazy(() => import('@/pages/ADMIN/Settings/components/System.setting'))
const Manage = lazy(() => import('@/pages/ADMIN/Manage'))
const HomePage = lazy(() => import('@/pages/ALL/Home'))
const AboutUs = lazy(() => import('@/pages/ALL/AboutUs'))
const Profile = lazy(() => import('@/pages/USER/Pages/Profile'))
const UserLayout = lazy(() => import('@/pages/USER/Layouts'))
const ChangePassword = lazy(() => import('@/pages/USER/Pages/ChangePassword'))
const History = lazy(() => import('@/pages/USER/Pages/History'))
const AnimatedOutlet = lazy(() => import('@/components/AnimatedOutlet'))
const Booking = lazy(() => import('@/pages/ADMIN/Booking'))
const Post = lazy(() => import('@/pages/ADMIN/Manage/Post.manage/Post'))
const Settings = lazy(() => import('@/pages/USER/Pages/Settings'))
const Dashboard = lazy(() => import('@/pages/ADMIN/Dashboard/Dashboard'))
const PaymentResult = lazy(() => import('@/pages/ALL/PaymentResult'))
const LoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-screen flex-col gap-4'>
    <video autoPlay loop muted className='size-80 object-cover'>
      <source src={CleanLoading} type='video/mp4' />
    </video>
    <h1 className='text-2xl font-bold'>Loading...</h1>
  </div>
)

const LazyComponent = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
)

interface RouteConfig {
  path: string
  element: ReactNode
  children?: RouteObject[] | undefined
}

function ProtectedRouteAdmin() {
  //admin
  const { isAuthenticated, profile } = useContext(AppContext)
  if (profile?.roles && rolesCheck.isAdminOrSale(profile.roles) && isAuthenticated) {
    return <Outlet />
  }
  return <Navigate to={path.login} />
}

function ProtectedRouteUser() {
  // user
  const { isAuthenticated, profile } = useContext(AppContext)
  if (profile?.roles && rolesCheck.isUser(profile.roles) && isAuthenticated) {
    return <Outlet />
  }
  return <Navigate to={path.login} />
}

function RejectedRoute() {
  //login
  const { isAuthenticated, profile } = useContext(AppContext)
  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={rolesCheck.isAdminOrSale(profile?.roles || []) ? path.admin.dashboard : path.home} />
  )
}

export default function useRoutesElements() {
  const location = useLocation()

  const routes: RouteConfig[] = [
    {
      path: '',
      element: (
        <LazyComponent>
          <AnimatedOutlet />
        </LazyComponent>
      ),
      children: [
        {
          path: path.home,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: path.aboutUs,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <AboutUs />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: path.paymentResult,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <PaymentResult />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: path.coming_soon,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <ComingSoon />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: path.products,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <Products />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: path.productDetail,
          element: (
            <LazyComponent>
              <CustomerLayout>
                <ProductDetail />
              </CustomerLayout>
            </LazyComponent>
          )
        },
        {
          path: '',
          element: <ProtectedRouteUser />,
          children: [
            {
              path: path._user,
              element: (
                <LazyComponent>
                  <CustomerLayout>
                    <UserLayout />
                  </CustomerLayout>
                </LazyComponent>
              ),
              children: [
                {
                  path: path.user.profile,
                  element: (
                    <LazyComponent>
                      <Profile />
                    </LazyComponent>
                  )
                },
                {
                  path: path.user.history,
                  element: (
                    <LazyComponent>
                      <History />
                    </LazyComponent>
                  )
                },
                {
                  path: path.user.change_password,
                  element: (
                    <LazyComponent>
                      <ChangePassword />
                    </LazyComponent>
                  )
                },
                {
                  path: path.user.settings,
                  element: (
                    <LazyComponent>
                      <Settings />
                    </LazyComponent>
                  )
                }
              ]
            }
          ]
        },
        {
          path: '',
          element: <RejectedRoute />,
          children: [
            {
              path: path.login,
              element: (
                <LazyComponent>
                  <Login />
                </LazyComponent>
              )
            },
            {
              path: path.register,
              element: (
                <LazyComponent>
                  <Register />
                </LazyComponent>
              )
            }
          ]
        },
        {
          path: '*',
          element: (
            <LazyComponent>
              <CustomerLayout>
                <PageNotFound />
              </CustomerLayout>
            </LazyComponent>
          )
        }
      ]
    },
    {
      path: path._admin,
      element: <ProtectedRouteAdmin />,
      children: [
        {
          path: path._admin,
          element: (
            <LazyComponent>
              <LayoutMain />
            </LazyComponent>
          ),
          children: [
            {
              path: path.admin.dashboard,
              element: (
                <LazyComponent>
                  <Dashboard />
                </LazyComponent>
              )
            },
            {
              path: path.admin.coming_soon,
              element: (
                <LazyComponent>
                  <ComingSoon />
                </LazyComponent>
              )
            },
            {
              path: path.admin.booking,
              element: (
                <LazyComponent>
                  <Booking />
                </LazyComponent>
              )
            },
            {
              path: path.admin._setting,
              element: (
                <LazyComponent>
                  <Setting />
                </LazyComponent>
              ),
              children: [
                {
                  path: path.admin.setting.profile,
                  element: (
                    <LazyComponent>
                      <ProfileAdmin />
                    </LazyComponent>
                  )
                },
                {
                  path: path.admin.setting.system,
                  element: (
                    <LazyComponent>
                      <SystemSetting />
                    </LazyComponent>
                  )
                }
              ]
            },
            {
              path: path.admin._manage,
              element: (
                <LazyComponent>
                  <Manage />
                </LazyComponent>
              ),
              children: [
                {
                  path: path.admin.manage.category,
                  element: (
                    <LazyComponent>
                      <Category />
                    </LazyComponent>
                  )
                },
                {
                  path: path.admin.manage.product,
                  element: (
                    <LazyComponent>
                      <Product />
                    </LazyComponent>
                  )
                },
                {
                  path: path.admin.manage.user,
                  element: (
                    <LazyComponent>
                      <User />
                    </LazyComponent>
                  )
                },
                {
                  path: path.admin.manage.sale,
                  element: (
                    <LazyComponent>
                      <Sale />
                    </LazyComponent>
                  )
                },
                {
                  path: path.admin.manage.post,
                  element: (
                    <LazyComponent>
                      <Post />
                    </LazyComponent>
                  )
                }
              ]
            }
          ]
        }
      ]
    }
  ]

  const routeElements = useRoutes(routes, location)

  return <Fragment>{routeElements}</Fragment>
}
