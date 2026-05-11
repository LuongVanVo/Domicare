import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingPortal } from '@floating-ui/react'

interface ModalProps {
  children: ReactNode
  render: ReactNode
}

export default function Modal({ children, render }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)} className='cursor-pointer'>
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <motion.div
              className='fixed inset-0 flex justify-center items-center bg-black/30 z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {render}
              </motion.div>
            </motion.div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  )
}
