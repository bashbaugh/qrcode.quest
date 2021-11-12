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
import { useState } from 'react'
import axios from 'lib/axios'
import { useRouter } from 'next/router'
import { CreateResponse } from './api/create'

interface FormValues {
  name: string
  numberOfSteps: string
}

const Create: NextPage = () => {
  useRequireAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit } = useForm<FormValues>()

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)

    const res = await axios.post<CreateResponse>('/api/create', {
      name: data.name,
      steps: parseInt(data.numberOfSteps),
    })

    router.replace(`/q/${res.data.quest.id}`)
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
              <NumberInputField {...register('numberOfSteps')} />
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
