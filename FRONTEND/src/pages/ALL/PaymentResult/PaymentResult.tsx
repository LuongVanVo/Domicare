import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconLeftArrow } from '../404/PageNotFound'
import { path } from '@/core/constants/path'

type PaymentStatus = 'success' | 'failure' | 'invalid' | null

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>(null)
  const [orderInfo, setOrderInfo] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    const queryStatus = searchParams.get('status') as PaymentStatus
    const queryOrder = searchParams.get('orderInfo') || ''
    const queryAmount = searchParams.get('amount') || ''
    setStatus(queryStatus)
    setOrderInfo(queryOrder)
    setAmount(queryAmount)
  }, [searchParams])

  const renderMessage = () => {
    switch (status) {
      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-center bg-green-50 border border-green-400 rounded-2xl px-8 py-6 shadow-md text-green-800 text-center'
          >
            <div className='text-4xl mb-2'>🎉</div>
            <h2 className='text-2xl font-bold mb-3'>Thanh toán thành công!</h2>
            <p>
              Mã đơn hàng: <strong>{orderInfo}</strong>
            </p>
            <p className='mt-1'>
              Số tiền: <strong>{Number(amount) / 100} VND</strong>
            </p>
            <p className='mt-3 text-gray-700'>
              Cảm ơn bạn đã đặt cọc dịch vụ của <strong className='text-main'>DomiCare</strong>.
            </p>
            <Link
              to={path.home}
              className='flex items-center gap-2 mt-6 text-primary font-medium hover:text-primary-dark transition'
            >
              {IconLeftArrow}
              Trang chủ
            </Link>
          </motion.div>
        )

      case 'failure':
        return (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-center bg-red-50 border border-red-400 rounded-2xl px-8 py-6 shadow-md text-red-800 text-center'
          >
            <div className='text-4xl mb-2'>❌</div>
            <h2 className='text-2xl font-bold mb-3'>Thanh toán thất bại</h2>
            <p>
              Mã đơn hàng: <strong>{orderInfo}</strong>
            </p>
            <p className='mt-1'>
              Số tiền: <strong>{Number(amount) / 100} VND</strong>
            </p>
            <p className='mt-3 text-gray-700'>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
            <Link
              to={path.home}
              className='flex items-center gap-2 mt-6 text-primary font-medium hover:text-primary-dark transition'
            >
              {IconLeftArrow}
              Trang chủ
            </Link>
          </motion.div>
        )

      case 'invalid':
        return (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-center bg-yellow-50 border border-yellow-400 rounded-2xl px-8 py-6 shadow-md text-yellow-800 text-center'
          >
            <div className='text-4xl mb-2'>⚠️</div>
            <h2 className='text-2xl font-bold mb-3'>Dữ liệu không hợp lệ</h2>
            <p>Không thể xác thực thông tin giao dịch.</p>
            <p className='mt-1'>
              Mã đơn hàng: <strong>{orderInfo}</strong>
            </p>
            <Link
              to={path.home}
              className='flex items-center gap-2 mt-6 text-primary font-medium hover:text-primary-dark transition'
            >
              {IconLeftArrow}
              Trang chủ
            </Link>
          </motion.div>
        )

      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col items-center bg-gray-50 border border-gray-300 rounded-2xl px-8 py-6 shadow-md text-gray-700 text-center'
          >
            <div className='text-4xl mb-2'>⏳</div>
            <h2 className='text-xl font-semibold mb-2'>Đang xử lý giao dịch...</h2>
            <p>Vui lòng đợi trong giây lát...</p>
          </motion.div>
        )
    }
  }

  return (
    <div className='flex flex-col mt-20 items-center py-20 bg-white'>
      <div className='w-full max-w-lg px-6'>{renderMessage()}</div>
    </div>
  )
}

export default PaymentResult
