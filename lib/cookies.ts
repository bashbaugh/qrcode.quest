import {
  NextApiRequest,
  NextApiResponse,
  NextPage,
  NextPageContext,
} from 'next'
import cookie from 'cookie'

export const SCANNED_CODES_COOKIE_NAME = 'sqrcs'
export const CLAIMED_QUESTS_COOKIE_NAME = 'clquests'
export const COOKIE_DELIMITER = ','

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

export const getCookieData = (
  req: NextApiRequest | NextPageContext['req']
): {
  scannedCodes: string[]
  claimedQuests: string[]
} => {
  const cookies = cookie.parse(req?.headers.cookie || '')
  const scannedCodes = (cookies[SCANNED_CODES_COOKIE_NAME] || '').split(
    COOKIE_DELIMITER
  )
  const claimedQuests = (cookies[CLAIMED_QUESTS_COOKIE_NAME] || '').split(
    COOKIE_DELIMITER
  )

  return { scannedCodes, claimedQuests }
}
