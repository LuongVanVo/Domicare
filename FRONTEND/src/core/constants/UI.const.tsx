import { IconRedTick } from '@/assets/icons/icon-redTick'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { clear, handsharke, legal, team, vacuum, wipe } from '@/assets/images'

export const useFeatures = () => {
  const { t } = useTranslation('about_us')
  return [
    {
      icon: <IconRedTick />,
      title: t('reliable_service'),
      description: t('reliable_service_description')
    },
    {
      icon: <IconRedTick />,
      title: t('quality_assurance'),
      description: t('quality_assurance_description')
    },
    {
      icon: <IconRedTick />,
      title: t('trusted_partner'),
      description: t('trusted_partner_description')
    },
    {
      icon: <IconRedTick />,
      title: t('reliable_solution'),
      description: t('reliable_solution_description')
    }
  ]
}

export const getServices = () => [
  {
    icon: <img className='size-20' src={clear} alt='clear' />,
    title: i18next.t('about_us:cleaning_program')
  },
  {
    icon: <img className='size-20' src={vacuum} alt='vacuum' />,
    title: i18next.t('about_us:modern_equipment')
  },
  {
    icon: <img className='size-20' src={handsharke} alt='handsharke' />,
    title: i18next.t('about_us:customer_service')
  },
  {
    icon: <img className='size-20' src={legal} alt='legal' />,
    title: i18next.t('about_us:licensed')
  },
  {
    icon: <img className='size-20' src={team} alt='team' />,
    title: i18next.t('about_us:professional_training')
  },
  {
    icon: <img className='size-20' src={wipe} alt='wipe' />,
    title: i18next.t('about_us:sterilization_program')
  }
]
