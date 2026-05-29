export interface DashboardListConfig {
  startDate?: string
  endDate?: string
}
export interface RevenueData {
  totalRevenue?: {
    [key: string]: number
  }
  growthRate?: number
}
export interface ChartItem {
  month: string
  revenue: number
}

export interface MetricValue {
  value?: number
  change?: number
}

export interface DashboardSummary {
  revenue?: MetricValue
  bookings?: MetricValue
  customers?: MetricValue
  products?: MetricValue
}

export interface BookingOverview {
  totalBookings?: number
  totalSuccessBookings?: number
  totalFailedBookings?: number
  totalAcceptedBookings?: number
  totalRejectedBookings?: number
  totalRevenueBookings?: number
  totalPendingBookings?: number
}

export interface DashboardData {
  dashboardSummary?: DashboardSummary
  bookingOverview?: BookingOverview
}
