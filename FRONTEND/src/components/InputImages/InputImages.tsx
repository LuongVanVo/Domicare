import { SetStateAction, Dispatch, useRef, useState } from 'react'
import { Toast } from '@/utils/toastMessage'
import { ImagePlus, Trash2, FileImage } from 'lucide-react'
import config from '@/configs'
import { useFileUpload } from '@/core/queries/file.query'
import { UploadingFile } from '@/models/interface/file.interface'
import { Progress } from '../ui/progress'
import isEqual from 'lodash/isEqual'
import { Button } from '../ui/button'

interface InputImagesProps {
  values: string[]
  setValues: Dispatch<SetStateAction<string[]>>
}

export default function InputImages({ values, setValues }: InputImagesProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadFile } = useFileUpload({ setUploadingFiles, uploadingFiles, setValues, isMutiple: true })
  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  // Chọn file qua input
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    handleFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  // Kiểm tra và upload file
  const handleFiles = (files: File[]) => {
    const validFiles: File[] = []
    let hasInvalidFile = false
    files.forEach((file) => {
      if (file.size < config.maxSizeUploadAvatar && file.type.includes('image')) {
        validFiles.push(file)
      } else {
        hasInvalidFile = true
      }
    })
    if (hasInvalidFile) {
      Toast.error({
        description: `Dung lượng file tối đa 2MB\nĐịnh dạng .JPEG .PNG`
      })
      return
    }
    if (validFiles.length > 0) {
      validFiles.forEach((file) => {
        return uploadFile(file)
      })
    }
  }
  // Xóa file khỏi danh sách
  const handleRemoveFile = (index: number, isUploading = false) => {
    if (isUploading) {
      setUploadingFiles((prev) => prev.filter((_, i) => i !== index))
    } else {
      const newFiles = [...values]
      newFiles.splice(index, 1)
      setValues(newFiles)
    }
  }

  return (
    <div className='w-full h-full flex flex-col md:flex-row gap-6 bg-white rounded-2xl p-6 shadow'>
      {/* Drag & Drop + Browse */}
      <div
        className='flex-1 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl min-h-[220px] cursor-pointer transition hover:border-green-400 bg-gray-50'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <ImagePlus className='w-12 h-12 text-main mb-2' />
        <div className='text-gray-600 mb-2 text-sm text-center'>
          Kéo và thả ảnh để tải lên
          <br />
          hoặc
        </div>
        <Button
          type='button'
          className='bg-main text-white px-4 py-2 rounded font-semibold hover:bg-main/80 transition text-sm mb-2'
          onClick={() => inputRef.current?.click()}
        >
          Chọn ảnh
        </Button>
        <div className='text-xs text-gray-400'>Định dạng: JPEG, PNG (tối đa 2MB)</div>
        <input
          ref={inputRef}
          id='inputFiles'
          hidden
          type='file'
          accept='.jpg, .jpeg, .png'
          multiple
          onChange={onFileChange}
        />
      </div>
      {/* Danh sách file đã upload và đang upload */}
      <div className='flex-1'>
        <div className='font-semibold mb-2'>Danh sách ảnh </div>
        <div className='flex flex-col gap-3'>
          {/* Đang upload */}
          {uploadingFiles.map((item, idx) => {
            return item.status !== 'done' ? (
              <div key={item.file.name} className='flex items-center gap-3 bg-gray-100 rounded p-2 relative'>
                <FileImage className='w-5 h-5  text-green-800' />
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{item.file.name}</div>
                  {!isEqual(item.status, 'done') ? <Progress type={item.status} value={item.progress} /> : null}
                  {item.status === 'error' && <div className='text-xs text-red-500'>Tải ảnh thất bại</div>}
                </div>
                <button
                  type='button'
                  className='ml-2 text-gray-400 hover:text-red-500 transition'
                  onClick={() => handleRemoveFile(idx, true)}
                >
                  <span className='flex gap-1 items-center'>
                    <p className='text-gray text-xs'>{item.progress}%</p>
                    <Trash2 className='w-5 h-5' />
                  </span>
                </button>
              </div>
            ) : null
          })}
          {/* Đã upload */}
          {values.map((item, index) => (
            <div key={index} className='flex items-center gap-3 bg-gray-50 rounded p-2 relative'>
              <FileImage className='w-5 h-5 text-green-900' />
              <div className='flex-1'>
                <div className='text-sm '>
                  {uploadingFiles.find((file) => file.uploadedFile?.url === item)?.file.name || 'Đã tải lên'}
                </div>
                {item && (
                  <a href={item} target='_blank' rel='noopener noreferrer' className='text-xs text-blue-500 underline'>
                    Xem ngay
                  </a>
                )}
              </div>
              <button
                type='button'
                className='ml-2 text-gray-400 hover:text-red-500 transition'
                onClick={() => handleRemoveFile(index)}
              >
                <Trash2 className='w-5 h-5' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
