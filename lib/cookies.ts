import { NextApiResponse, NextPageContext } from 'next'

export const setCookieHeader = (
  res: NextApiResponse | NextPageContext['res'],
  name: string,
  value: string
) => {
  const expDate = new Date()
  // Expire after one year:
  expDate.setFullYear(expDate.getFullYear() + 1)

  res?.setHeader('Set-Cookie', [
    `${name}=${value}; Expires=${expDate.toUTCString()}`,
  ])
}
