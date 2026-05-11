import { useLocation } from 'react-router-dom'
import { path } from '@/core/constants/path'
import { Helmet as ReactHelmet } from 'react-helmet-async'

const PAGE_TITLES = {
  // Public routes
  [path.home]: 'Trang Chủ - DomiCare',
  [path.aboutUs]: 'Tại sao lại chọn DomiCare - DomiCare',
  [path.products]: 'Dịch vụ cung cấp - DomiCare',
  [path.product]: 'Dịch vụ - DomiCare',
  [path.productDetail]: 'Chi tiết dịch vụ - DomiCare',
  [path.blog]: 'Tin tức - DomiCare',
  [path.recuitment]: 'Tuyển dụng - DomiCare',
  [path.coming_soon]: 'Sắp ra mắt - DomiCare',
  [path.notFound]: 'Trang không tìm thấy - DomiCare',

  // Auth routes
  [path.login]: 'Đăng nhập - DomiCare',
  [path.register]: 'Đăng ký - DomiCare',
  [path.forgotPassword]: 'Quên mật khẩu - DomiCare',

  // User routes
  [path.user.profile]: 'Thông tin cá nhân - DomiCare',
  [path.user.history]: 'Lịch sử đơn hàng - DomiCare',
  [path.user.change_password]: 'Đổi mật khẩu - DomiCare',
  [path.user.settings]: 'Cài đặt tài khoản - DomiCare',

  // Admin routes
  [path.admin.dashboard]: 'Báo cáo & Thống kê - DomiCare Admin',
  [path.admin.coming_soon]: 'Sắp ra mắt - DomiCare Admin',
  [path.admin.booking]: 'Quản lý đơn hàng - DomiCare Admin',
  [path.admin.manage.user]: 'Quản lý khách hàng - DomiCare Admin',
  [path.admin.manage.sale]: 'Quản lý nhân viên - DomiCare Admin',
  [path.admin.manage.category]: 'Quản lý danh mục - DomiCare Admin',
  [path.admin.manage.product]: 'Quản lý dịch vụ - DomiCare Admin',
  [path.admin.manage.post]: 'Quản lý bài viết - DomiCare Admin',
  [path.admin.setting.profile]: 'Cài đặt cá nhân - DomiCare Admin',
  [path.admin.setting.system]: 'Cài đặt hệ thống - DomiCare Admin'
} as const

const PAGE_DESCRIPTIONS = {
  // Public routes
  [path.home]: 'DomiCare - Dịch vụ vệ sinh chuyên nghiệp, uy tín, tận tâm tại Việt Nam.',
  [path.aboutUs]: 'Tìm hiểu lý do tại sao nên chọn DomiCare cho nhu cầu vệ sinh của bạn.',
  [path.products]: 'Khám phá các dịch vụ vệ sinh mà DomiCare cung cấp.',
  [path.product]: 'Thông tin chi tiết về các dịch vụ vệ sinh của DomiCare.',
  [path.productDetail]: 'Xem chi tiết dịch vụ, bảng giá và đánh giá từ khách hàng của DomiCare.',
  [path.blog]: 'Tin tức, mẹo vặt và kiến thức về vệ sinh từ DomiCare.',
  [path.recuitment]: 'Cơ hội việc làm và tuyển dụng tại DomiCare.',
  [path.coming_soon]: 'Các dịch vụ và tính năng mới sắp ra mắt tại DomiCare.',
  [path.notFound]: 'Trang không tồn tại hoặc đã bị xóa trên DomiCare.',

  // Auth routes
  [path.login]: 'Đăng nhập vào hệ thống DomiCare để sử dụng các dịch vụ tiện ích.',
  [path.register]: 'Tạo tài khoản mới để trải nghiệm dịch vụ vệ sinh chuyên nghiệp từ DomiCare.',
  [path.forgotPassword]: 'Khôi phục mật khẩu tài khoản DomiCare của bạn một cách dễ dàng.',

  // User routes
  [path.user.profile]: 'Quản lý và cập nhật thông tin cá nhân của bạn trên DomiCare.',
  [path.user.history]: 'Xem lại lịch sử các đơn hàng dịch vụ vệ sinh của bạn.',
  [path.user.change_password]: 'Đổi mật khẩu tài khoản DomiCare để bảo mật hơn.',
  [path.user.settings]: 'Cài đặt tài khoản và các tùy chọn cá nhân trên DomiCare.',

  // Admin routes
  [path.admin.dashboard]: 'Báo cáo, thống kê tổng quan hoạt động của hệ thống DomiCare Admin.',
  [path.admin.coming_soon]: 'Các tính năng quản trị mới sắp ra mắt trên DomiCare Admin.',
  [path.admin.booking]: 'Quản lý, theo dõi các đơn hàng dịch vụ vệ sinh của khách hàng.',
  [path.admin.manage.user]: 'Quản lý thông tin và hoạt động của khách hàng trên hệ thống.',
  [path.admin.manage.sale]: 'Quản lý nhân viên kinh doanh và các hoạt động bán hàng.',
  [path.admin.manage.category]: 'Quản lý danh mục dịch vụ vệ sinh của DomiCare.',
  [path.admin.manage.product]: 'Quản lý các dịch vụ vệ sinh được cung cấp bởi DomiCare.',
  [path.admin.manage.post]: 'Quản lý bài viết, tin tức trên hệ thống DomiCare Admin.',
  [path.admin.setting.profile]: 'Cài đặt thông tin cá nhân cho tài khoản quản trị viên.',
  [path.admin.setting.system]: 'Cài đặt hệ thống, cấu hình chung cho DomiCare Admin.'
} as const

interface HelmetProps {
  title?: string
  description?: string
}

export default function Helmet({ title, description }: HelmetProps) {
  const location = useLocation()
  const titleAuto = PAGE_TITLES[location.pathname as keyof typeof PAGE_TITLES] || 'DomiCare'
  const descriptionAuto =
    PAGE_DESCRIPTIONS[location.pathname as keyof typeof PAGE_DESCRIPTIONS] || 'Domicare - Dịch vụ vệ sinh chuyên nghiệp'

  return (
    <ReactHelmet>
      <title>{title ? title : titleAuto}</title>
      <meta name='description' content={description ? description : descriptionAuto} />
    </ReactHelmet>
  )
}
