import type { AppProps } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import '../styles/nprogress.css'
import '../styles/globals.css'
import { getApps, initializeApp } from 'firebase/app'
import firebaseConfig from '../firebaseConfig.json'
import { ChakraProvider } from '@chakra-ui/react'

NProgress.configure({
  minimum: 0.4,
  showSpinner: false,
})

if (!getApps().length) initializeApp(firebaseConfig)

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </div>
  )
}
export default MyApp
