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
} from '@chakra-ui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRequireAuth } from 'lib/hooks'
import { useRef, useState } from 'react'
import axios from 'lib/axios'
import { useRouter } from 'next/router'
import { CreateResponse } from './api/quest/create'
import { useToast } from 'lib/toast'

interface FormValues {
  name: string
  numberOfSteps: string
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
        steps: parseInt(numberOfStepsRef.current?.value),
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

          <Button isLoading={submitting} type="submit" colorScheme={'blue'}>
            Generate My Quest
          </Button>
        </Flex>
      </form>
    </Layout>
  )
}

export default Create
