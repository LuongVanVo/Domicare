export interface FileResponse {
  id?: number
  name?: string
  type?: string
  size?: string
  url?: string
  publicId?: string
  createBy?: string
  updateBy?: string
  createAt?: string
  updateAt?: string
}
export interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'done' | 'error'
  uploadedFile?: FileResponse
}
