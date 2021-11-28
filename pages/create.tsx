import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import {
  Heading,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Tooltip,
  Text,
  Select,
} from '@chakra-ui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRequireAuth } from 'lib/hooks'
import { useRef, useState } from 'react'
import axios from 'lib/axios'
import { useRouter } from 'next/router'
import { CreateResponse } from './api/quest/create'
import { useToast } from 'lib/toast'
import Link from 'next/link'
import { ArrowBackIcon, InfoOutlineIcon } from '@chakra-ui/icons'
import { Quest } from '@prisma/client'

interface FormValues {
  name: string
  numberOfSteps: string
  victoryFulfillment: Quest['victoryFulfillment']
}

const Create: NextPage = () => {
  useRequireAuth()
  const router = useRouter()
  const numberOfStepsRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit } = useForm<FormValues>()
  const toast = useToast()

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)

    try {
      const res = await axios.post<CreateResponse>('/api/quest/create', {
        name: data.name,
        steps: parseInt(numberOfStepsRef.current?.value!),
        victoryFulfillment: data.victoryFulfillment,
      })

      router.replace(`/q/${res.data.quest.id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Something went wrong. Please try again',
        status: 'error',
      })
      setSubmitting(false)
    }
  })

  return (
    <Layout>
      <Meta title="Create a Quest" />
      <Link href="/quests">
        <a>
          <Button leftIcon={<ArrowBackIcon />} variant={'link'}>
            My quests
          </Button>
        </a>
      </Link>
      <Heading>Create a Quest</Heading>
      <form onSubmit={onSubmit}>
        <Flex
          direction={'column'}
          shadow="xl"
          p="6"
          my="6"
          gridGap={'4'}
          rounded="lg"
        >
          <FormControl isRequired>
            <FormLabel>Quest Name</FormLabel>
            <Input {...register('name')} />

            <FormHelperText>Name your quest</FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Number of Steps</FormLabel>
            <NumberInput precision={0} min={1} max={20} defaultValue={5}>
              <NumberInputField ref={numberOfStepsRef} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <FormHelperText>
              How many QR codes should we generate?
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>
              <Tooltip
                placement="auto-end"
                label={
                  <Flex direction={'column'} gridGap={'1'}>
                    <p>
                      Codes: give questers a unique code when they scan the last
                      QR code that they can share with you, allowing you to
                      verify that they completed it.
                    </p>
                    <p>
                      Collect emails: Ask users for their emails, which will
                      then be shared with you.
                    </p>
                    <p>
                      None: There&apos;s no way to automatically track your
                      victors. You&apos;ll have to confirm manually that they
                      completed the quest by having them scan one of the codes.
                    </p>
                  </Flex>
                }
              >
                <Text
                  as="span"
                  display={'inline-flex'}
                  alignItems={'center'}
                  gridGap={'1'}
                >
                  Completion tracking <InfoOutlineIcon />
                </Text>
              </Tooltip>
            </FormLabel>
            <Select {...register('victoryFulfillment')} defaultValue={'NONE'}>
              <option value="NONE">Don&apos;t track quest completions</option>
              <option value="CLAIM_CODE">
                Generate secret codes for winners
              </option>
              <option value="COLLECT_EMAIL">
                Collect winners&apos; emails
              </option>
            </Select>
            <FormHelperText>
              How do you want to keep track of everyone who completes your
              quest? Hover above the info icon to learn more.
            </FormHelperText>
          </FormControl>

          <Button
            isLoading={submitting}
            loadingText="Generating QR codes..."
            type="submit"
            colorScheme={'primary'}
          >
            Continue to Setup
          </Button>
        </Flex>
      </form>
    </Layout>
  )
}

export default Create
