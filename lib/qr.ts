import QRCode from 'easyqrcodejs-nodejs'

export const getQrCode = (slug: string): Promise<string> => {
  const code = new QRCode({
    text: `https://qrcode.quest/${slug}`,
  })
  return code.toDataURL()
}
