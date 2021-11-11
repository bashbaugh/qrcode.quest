import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import {
  Box,
  Center,
  Flex,
  Heading,
  Button,
  Input,
  useToast,
  Text,
  Spinner,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

const googleProvider = new GoogleAuthProvider()

import clsx from 'clsx'

const AuthProviderButton: React.FC<{
  iconName: string
  onClick: () => void
}> = ({ children, iconName, onClick }) => {
  return (
    <button
      className={clsx(
        'w-full rounded-sm py-3 bg-white shadow-lg flex items-center justify-center gap-2 border hover:shadow-xl transition-all duration-300'
      )}
      onClick={onClick}
      // onClick={onClick}
    >
      <img src={`/icon/${iconName}.svg`} className="w-7" alt={iconName} />
      <span>{children}</span>
    </button>
  )
}

const SignIn: NextPage = () => {
  const router = useRouter()
  const toast = useToast({
    position: 'top',
  })
  const [signingIn, setSigningIn] = useState(false)

  const signInWithProvider = async (provider: any) => {
    const auth = getAuth()
    setSigningIn(true)
    try {
      await signInWithPopup(auth, provider)
      router.push('/quests')
    } catch {
      setSigningIn(false)
    }
  }

  return (
    <Layout>
      <Meta title="Sign In" />
      <Center h="100%">
        <Flex
          w="72"
          direction="column"
          gridGap="5"
          textAlign="center"
          borderWidth="1px"
          borderRadius="lg"
          p="6"
        >
          <Heading>Sign In</Heading>

          {signingIn ? (
            <Spinner mx="auto" size="xl" />
          ) : (
            <>
              <Text>Please choose a sign-in provider</Text>

              <AuthProviderButton
                iconName="google"
                onClick={() => signInWithProvider(googleProvider)}
              >
                Sign in with Google
              </AuthProviderButton>
            </>
          )}
        </Flex>
      </Center>
    </Layout>
  )
}

export default SignIn
