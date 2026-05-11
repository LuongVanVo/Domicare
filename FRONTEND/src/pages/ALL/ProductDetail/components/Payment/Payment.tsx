import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Product } from '@/models/interface/product.interface'
import axiosClient from '@/core/services/axios-client'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PaymentProps {
    product?: Product
    isOpen: boolean
    setIsOpen: ( open: boolean ) => void
}

export default function Payment ( { product, isOpen, setIsOpen }: PaymentProps ) {
    const { t } = useTranslation( 'product' )

    const handleDeposit = async () => {
        const amount = product?.priceAfterDiscount ? product.priceAfterDiscount * 0.1 : 0
        const orderInfo = `Dat coc dich vu ${ product?.name } - ${ amount } VND`
        const orderId = `ORDER_${ new Date().getTime() }`

        try {
            const response = await axiosClient.post( '/payment/create-payment', {
                amount,
                orderInfo,
                orderId
            } )

            const paymentURL = response.data.data.paymentUrl
            window.open( paymentURL, '_blank' )
            setIsOpen( false )
        } catch ( error ) {
            console.error( 'Payment error:', error )
            // TODO: Show error notification to user
        }
    }
    return (
        <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
            <DialogContent className='flex justify-center items-center'>
                <Card className='max-w-3xl w-full  p-4'>
                    <CardHeader className='text-center'>
                        <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-2' />
                        <CardTitle className='text-xl font-semibold text-green-600'>{ t( 'payment.success_title' ) }</CardTitle>
                    </CardHeader>

                    <CardContent className='text-center space-y-4'>
                        <p className='text-gray-700 leading-relaxed'>
                            { t( 'payment.thank_you_message' ) }
                            <br />
                            { t( 'payment.deposit_option_text' ) }{ ' ' }
                            <span className='font-semibold text-green-600'>{ t( 'payment.deposit_option_highlight' ) }</span>{ ' ' }
                            { t( 'payment.deposit_option_suffix' ) }
                        </p>

                        <p className='text-gray-600 italic'>
                            { t( 'payment.refund_policy_prefix' ) }
                            <span className='font-semibold text-green-600'> { t( 'payment.refund_policy_highlight' ) }</span>.
                        </p>

                        <div className='flex justify-center gap-4 pt-4'>
                            <Button
                                className='hover:bg-mainStrong cursor-pointer bg-green-700 text-white px-6 py-2 rounded-xl'
                                onClick={ handleDeposit }
                            >
                                { t( 'payment.deposit_button' ) }
                            </Button>
                            <Button
                                onClick={ () => setIsOpen( false ) }
                                variant='outline'
                                className='  cursor-pointer px-6 py-2 rounded-xl'
                            >
                                { t( 'payment.no_deposit_button' ) }
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
