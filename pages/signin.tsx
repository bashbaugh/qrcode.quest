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
  ButtonSpinner,
  Image,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

const googleProvider = new GoogleAuthProvider()

import clsx from 'clsx'

const AuthProviderButton: React.FC<{
  iconName: string
  onClick: () => void
}> = ({ children, iconName, onClick }) => {
  return (
    <Button
    variant={'unstyled'}
      w='full'
      rounded='sm'
      py='7'
      backgroundColor={'white'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      gridGap={'2'}
      border='1px'
      borderColor={'gray.200'}
      shadow='md'
      _hover={{
        shadow: 'xl',
      }}
      transition={'all 0.3s'}
      onClick={onClick}
      // onClick={onClick}
    >
      <Image src={`/icon/${iconName}.svg`} w='7' alt={iconName} />
      <span>{children}</span>
    </Button>
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
