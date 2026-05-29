import ChangeProfile from '@/components/ChangeProfile'
import SectionUser from '../../Layouts/SectionUser'
import { useTranslation } from 'react-i18next'

export default function Profile() {
  const { t } = useTranslation(['settings'])
  return (
    <SectionUser title={t('profile_title')} description={t('profile_description')}>
      <ChangeProfile />
    </SectionUser>
  )
}
