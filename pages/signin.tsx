import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Box, Center, Flex, Heading, Button, Input, useToast, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'

let recaptcha: RecaptchaVerifier
let recaptchaWidgetId: number
let confResult: ConfirmationResult

const SignIn: NextPage = () => {
  const router = useRouter()
  const toast = useToast({
    position: 'top'
  })
  const [input, setInput] = useState<string>('')
  const [waitingForConf, setWaitingForConf] = useState(false)

  const onSubmit = async () => {
    console.log('eeeb')
    const auth = getAuth()

    try {
      // TODO phone numbers from other countries
      confResult = await signInWithPhoneNumber(auth, '+1' + input, recaptcha)

      setInput('')
      setWaitingForConf(true)
    } catch (e) {
      toast({ title: `We couldn't send an authentication code to that number`, status: 'error' })
      console.error(e)

      // ;(window as any).grecaptcha.reset(recaptchaWidgetId)
    }
  }

  const onVerify = async () => {
    const auth = getAuth()

    const res = await confResult.confirm(input)

    if (res?.user) router.push('/dashboard')
  }

  useEffect(() => {
    const auth = getAuth()

    recaptcha = new RecaptchaVerifier(
      'sign-in-btn',
      {
        size: 'invisible'
      },
      auth
    )

    recaptcha.render().then(widgetId => {
      recaptchaWidgetId = widgetId
    })
  }, [])

  return (
    <Layout>
      <Meta title="Sign In" />
      <Center h="100vh">
        <Flex
          w='72'
          direction="column"
          gridGap="5"
          textAlign="center"
          borderWidth="1px"
          borderRadius="lg"
          p="6"
        >
          <Heading>Sign In</Heading>
          {!waitingForConf && <><Input
            type="tel"
            w="full"
            textAlign="center"
            placeholder="Phone number"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button id='sign-in-btn' onClick={onSubmit} colorScheme="purple">Sign In</Button>
          <Text fontSize='sm' color='gray'>You will receive an SMS message for verification. Standard rates apply.</Text></>}
          {waitingForConf && <><Text>We&apos;re texting you a 6-digit verification code. Please enter it here.</Text><Input
            type="tel"
            w="full"
            textAlign="center"
            placeholder="Verification code"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={onVerify} colorScheme="purple">Confirm</Button></>}

        </Flex>
      </Center>
    </Layout>
  )
}

export default SignIn
