export function formatRevenueData(totalRevenue: { [key: string]: number }) {
  return Object.entries(totalRevenue).map(([month, revenue]) => ({
    month: month.replace('Th 0', 'Th ').replace('Th0', 'Th ').trim(),
    revenue: revenue
  }))
}

export const formatCurrentcy = (num?: number) => {
  return new Intl.NumberFormat('de-DE').format(Number((num || 0).toFixed(2)))
}
export const formatNumberSold = (num?: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
  }).format(num || 0)
}
