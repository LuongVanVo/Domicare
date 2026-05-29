// This file runs only on Node.js server, not in browser or Vite SSR
import express from 'express'
import dotenv from 'dotenv'
import { HashAlgorithm, ProductCode, VNPay, ignoreLogger } from 'vnpay'

dotenv.config()

const router = express.Router()

const vnpay = new VNPay({
  tmnCode: process.env.VITE_TMN_CODE,
  secureSecret: process.env.VITE_SECURE_HASH,
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: true,
  loggerFn: ignoreLogger,
  endpoints: {
    paymentEndpoint: 'paymentv2/vpcpay.html',
    queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
    getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list'
  }
})

// API tạo URL thanh toán VNPAY
router.post('/create-payment', function (req, res) {
  const { amount, orderInfo, orderId } = req.body
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1'

  const url = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ip,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: process.env.VITE_VNP_RETURN_URL
  })

  res.json(url)
})

router.get('/return-payment', (req, res) => {
  const { vnp_Amount: amount, vnp_TxnRef: orderId } = req.query

  try {
    const verify = vnpay.verifyReturnUrl(req.query)

    if (!verify.isVerified) {
      return res.send('Xác thực tính toàn vẹn dữ liệu thất bại')
    }

    if (!verify.isSuccess) {
      return res.redirect(`/payment?status=failure&orderInfo=${orderId}&amount=${amount}`)
    }

    return res.redirect(`/payment?status=success&orderInfo=${orderId}&amount=${amount}`)
  } catch (error) {
    console.log(error)
    return res.redirect(`/payment?status=invalid&orderInfo=${orderId}&amount=${amount}`)
  }
})

export default router
