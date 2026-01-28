export function isWebKit(): boolean {
  const ua = navigator.userAgent;

  const isWebKitBrowser =
    ua.includes('Safari');

  return !!isWebKitBrowser;
}

export function getFilename(response: Response, defaultFilename: string) {
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return defaultFilename
}

export const downloadFile = async(response: Response, defaultFilename: string) => {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = getFilename(response, defaultFilename)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}