import JSZip from 'jszip'

export const zipAndDownloadB64Files = async (
  files: Array<{ name: string; file: string }>,
  downloadName: string
) => {
  const zip = new JSZip()

  for (const f in files) {
    zip.file(
      files[f].name,
      files[f].file.split(',')[1], // Remove prefix from b64-encoded URI string
      {
        base64: true,
      }
    )
  }

  const newFile = await zip.generateAsync({
    type: 'base64',
  })

  const a = document.createElement('a')
  a.href = 'data:application/zip;base64,' + newFile
  a.download = downloadName + '.zip' // ZIP File name
  a.click() // Trigger the download
}
