const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|_|`|-|{|}|\||\\/g, '')

export const urlSEO = (id: string, name: string) => {
  const url = name + '$d$' + id

  return removeSpecialCharacter(url).replace(/\s+/g, '-')
}
