import type { AppProps } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import '../styles/nprogress.css'
import '../styles/globals.css'
import { getApps, initializeApp } from 'firebase/app'
// import firebaseConfig from '../firebaseConfig.json'
import { ChakraProvider } from '@chakra-ui/react'
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from '@firebase/auth'
import { useGlobalState } from 'lib/state'
import axios from 'lib/axios'

NProgress.configure({
  minimum: 0.4,
  // showSpinner: false,
})

if (!getApps().length)
  initializeApp({
    apiKey: 'AIzaSyD_HhtJ1Kl6KbUrJbjUEFM5uoAxMBzPSys',
    authDomain: 'qr-code-quest.firebaseapp.com',
    projectId: 'qr-code-quest',
    storageBucket: 'qr-code-quest.appspot.com',
    messagingSenderId: '1079122501721',
    appId: '1:1079122501721:web:5e92b383b2664a11fc5148',
  })

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    return onAuthStateChanged(getAuth(), async (user) => {
      useGlobalState.setState({
        user,
      })

      const idToken = await user?.getIdToken()

      axios.defaults.headers.common['Authorization'] = user
        ? `Bearer ${await user.getIdToken()}`
        : ''
    })
  }, [])

  return (
    <div>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </div>
  )
}
export default MyApp
