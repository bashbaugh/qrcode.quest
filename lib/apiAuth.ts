import admin from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'

const saKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
saKey.private_key = saKey.private_key.replace(/\\n/g, '\n') // WHY DOES THIS WORKKKK WTF

if (!admin.apps.length)
  admin.initializeApp({
    credential: admin.credential.cert(saKey),
  })

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allow
): Promise<admin.auth.DecodedIdToken | undefined> {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(401).send('UNAUTHORIZED')
    return
  }

  const idToken = req.headers.authorization!.split('Bearer ')[1]

  const decodedToken = await admin
    .auth()
    .verifyIdToken(idToken, false)
    .catch((err) => {
      res.status(401).send('Error processing request')
    })

  const user = decodedToken
  if (user?.uid) {
    return user
  }
  else res.status(401).send('UNAUTHORIZED')
}
