export const redirectTo = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path
  }
}

export const replacePath = (path: string) => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', path)
  }
} 