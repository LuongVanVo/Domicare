import { useMutation } from '@tanstack/react-query'
import { mutationKeys } from '../helpers/key-tanstack'
import { fileApi } from '../services/file.service'
import { handleToastError } from '@/utils/handleErrorAPI'
import { Toast } from '@/utils/toastMessage'
import { Dispatch, SetStateAction } from 'react'
import { AxiosResponse } from 'axios'
import { SuccessResponse } from '@/models/interface/response.interface'
import { FileResponse, UploadingFile } from '@/models/interface/file.interface'

interface useFileUploadProps<T extends string[] | string> {
  uploadingFiles: UploadingFile[]
  setUploadingFiles: Dispatch<SetStateAction<UploadingFile[]>>
  setValues: Dispatch<SetStateAction<T>>
  isMutiple?: boolean
}

export function useFileUpload<T extends string[] | string>({
  setUploadingFiles,
  uploadingFiles,
  setValues,
  isMutiple = true
}: useFileUploadProps<T>) {
  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return fileApi.post(formData, {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, progress: percent } : f)))
        }
      })
    },
    onMutate: (file: File) => {
      const newUploading: UploadingFile = { file, progress: 0, status: 'uploading' }
      setUploadingFiles((prev) => [...prev, newUploading])
    },
    onSuccess: (res: AxiosResponse<SuccessResponse<FileResponse>>, file: File) => {
      setUploadingFiles((prev) => {
        const url = res?.data?.data?.url || ''
        if (isMutiple) {
          setValues((prev) => [...(prev as string[]), url] as T)
        } else {
          setValues(url as T)
        }
        return prev.map((f) =>
          f.file === file ? { ...f, progress: 100, status: 'done', uploadedFile: res.data.data } : f
        )
      })
    },
    onError: (_, file) => {
      setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, status: 'error' } : f)))
      Toast.error({ title: 'Upload thất bại', description: file.name })
    }
  })

  const uploadFile = (file: File) => {
    mutation.mutate(file)
  }

  return {
    uploadFile,
    uploadingFiles
  }
}

interface UploadFileMutationProps {
  formData: FormData
  onUploadProgress?: (progressEvent: ProgressEvent) => void
}

export const useUploadFileMutation = () =>
  useMutation({
    mutationKey: mutationKeys.uploadFile,
    mutationFn: ({ formData, onUploadProgress }: UploadFileMutationProps) =>
      fileApi.post(formData, { onUploadProgress }),
    onError: (error) => handleToastError(error),
    onSuccess: (data) => {
      Toast.success({ title: 'Thành công', description: data.data.message })
    }
  })
