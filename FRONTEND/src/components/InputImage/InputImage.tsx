import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { Label } from '../ui/label'
import { ImagePlus, FileImage } from 'lucide-react'
import { Progress } from '../ui/progress'
import { Toast } from '@/utils/toastMessage'
import config from '@/configs'
import { useFileUpload } from '@/core/queries/file.query'
import { UploadingFile } from '@/models/interface/file.interface'

interface InputImageProps {
  value: string
  setValues: Dispatch<SetStateAction<string>>
}

export default function InputImage({ value, setValues }: InputImageProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadFile } = useFileUpload({
    setUploadingFiles,
    uploadingFiles,
    setValues,
    isMutiple: false
  })

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size < config.maxSizeUploadAvatar && file.type.includes('image')) {
        uploadFile(file)
      } else {
        Toast.error({
          description: `Dung lượng file tối đa 2MB\nĐịnh dạng .JPEG .PNG`
        })
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className='relative w-full h-full'>
      <input ref={inputRef} id='inputFile' hidden type='file' accept='.jpg, .jpeg, .png' onChange={onFileChange} />
      <Label
        htmlFor='inputFile'
        className='absolute group !z-10 top-0 left-0 duration-300 cursor-pointer w-full h-full hover:bg-[rgba(0,0,0,0.2)] flex justify-center items-center flex-col'
      >
        <ImagePlus className='duration-300 opacity-100 !w-8 h-8 text-gray-400' />
        <span className='text-sm text-gray-500 duration-300 opacity-100'>Chọn ảnh chính (tối đa 2MB)</span>
      </Label>
      {(uploadingFiles[0]?.uploadedFile?.url || value) && (
        <img
          className='w-full h-full object-cover'
          alt='Hinh_anh'
          src={uploadingFiles[0]?.uploadedFile?.url || value}
        />
      )}

      {/* Progress bar */}
      {uploadingFiles.length > 0 && uploadingFiles[0].status !== 'done' && (
        <div className='absolute bottom-0 left-0 right-0 p-2 bg-white/80'>
          <div className='flex items-center gap-2'>
            <FileImage className='w-4 h-4 text-green-800' />
            <div className='flex-1'>
              <Progress type={uploadingFiles[0].status} value={uploadingFiles[0].progress} />
              <div className='text-xs text-gray-500 mt-1'>{uploadingFiles[0].progress}%</div>
              {uploadingFiles[0].status === 'error' && <div className='text-xs text-red-500'>Tải ảnh thất bại</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
