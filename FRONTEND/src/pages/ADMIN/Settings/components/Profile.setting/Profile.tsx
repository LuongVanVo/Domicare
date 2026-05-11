import ChangeProfile from '@/components/ChangeProfile'
import HeaderSettings from '../HeaderSettings'
import { useTranslation } from 'react-i18next'

export default function ProfileAdmin() {
  const { t } = useTranslation(['settings'])
  return (
    <HeaderSettings title={t('profile_settings')} description={t('profile_description')}>
      <ChangeProfile />
    </HeaderSettings>
  )
}
