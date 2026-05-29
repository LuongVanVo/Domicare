import { Badge } from '@/components/ui/badge'
import { BookingStatus } from '@/models/interface/booking.interface'
import { cn } from '@/core/lib/utils'
import { statusColors, statusLabels } from '@/configs/consts'

interface StatusBadgeProps {
  status: BookingStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn('text-white ', className)}
      style={{
        backgroundColor: statusColors[status as keyof typeof statusColors]
      }}
    >
      {statusLabels[status as keyof typeof statusLabels]}
    </Badge>
  )
}
