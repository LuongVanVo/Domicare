const config = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  maxSizeUploadAvatar: 1048576 * 2,
  googleId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || '',
  secrectClient: import.meta.env.VITE_CLIENT_SECRECT || '',
  googleURL: import.meta.env.VITE_GOOGLE_URL || '',
  clientUrl: import.meta.env.VITE_CLIENT_URL || '',
  TMN_CODE: import.meta.env.VITE_TMN_CODE || '',
  SECURE_HASH: import.meta.env.VITE_SECURE_HASH || ''
}

export default config
