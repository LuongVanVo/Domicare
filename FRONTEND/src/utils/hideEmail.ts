export default function hideEmail(email: string = ''): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email

  const hiddenLocal = local[0] + '*'.repeat(local.length - 1)
  return `${hiddenLocal}@${domain}`
}
