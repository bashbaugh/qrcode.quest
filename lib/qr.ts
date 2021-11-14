// import QRCode from 'easyqrcodejs-nodejs'
import qrcode from 'qrcode'

export const getQrCode = (url: string): Promise<string> => {
  // const code = new QRCode({
  //   text: `https://qrcode.quest/${slug}`,
  // })
  // return code.toDataURL()

  // const code = qrcode.create(url)
  return qrcode.toDataURL(url, {
    margin: 0,
    scale: 10,
  })
}
