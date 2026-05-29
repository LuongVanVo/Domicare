import config from '@/configs'
import { Toast } from '@/utils/toastMessage'
import { Label } from '../ui/label'
import { useTranslation } from 'react-i18next'

interface InputFileProps {
  setFile: (file: File) => void
}
export default function InputFile({ setFile }: InputFileProps) {
  const { t } = useTranslation(['common', 'toast'])
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.size < config.maxSizeUploadAvatar && file.type.includes('image')) {
      setFile?.(file)
    } else {
      // validate
      Toast.error({
        title: `${t('format_image')} ${t('format_image_description')}`
      })
    }
  }
  return (
    <div className=''>
      <input
        id='inputFile'
        hidden
        type='file'
        accept='.jpg, .jpeg, .png'
        onChange={onFileChange}
        onClick={(e) => ((e.target as any).value = null)}
      />
      <Label
        htmlFor='inputFile'
        className='border border-gray-300 px-4 py-3 text-sm capitalize text-gray duration-300 cursor-pointer hover:bg-[#f4f4f4]'
      >
        {t('toast:select_picture')}
      </Label>
    </div>
  )
}
