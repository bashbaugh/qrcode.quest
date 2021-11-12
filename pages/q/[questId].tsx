import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import {
  Heading,
  Skeleton,
  SkeletonText,
  Box,
  Stack,
  Text,
  Button,
  Flex,
  Image,
  StackDivider,
  Spacer,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Editable,
  EditablePreview,
  EditableInput,
  Textarea,
  Switch,
  FormLabel,
} from '@chakra-ui/react'
import { useGlobalState } from 'lib/state'
import { useRequireAuth } from 'lib/hooks'
import { useEffect, useRef, useState } from 'react'
import { GetQuestResponse } from 'pages/api/quest/[slug]'
import axios from 'lib/axios'
import { useToast } from 'lib/toast'
import create from 'zustand'
import { GetQuestsResponse } from 'pages/api/getquests'
import { DeleteResponse } from 'pages/api/quest/[slug]/delete'
import {
  ArrowBackIcon,
  AttachmentIcon,
  CheckIcon,
  DownloadIcon,
} from '@chakra-ui/icons'
import JSZip from 'jszip'
import Link from 'next/link'
import { UpdateQuestCodeResponse } from 'pages/api/quest/[slug]/updatecode'

const QuestSettings: NextPage = () => {
  useRequireAuth()
  const router = useRouter()
  const user = useGlobalState((s) => s.user)
  const [quest, setQuestData] = useState<GetQuestResponse['quest']>()
  const toast = useToast()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteCancelRef = useRef<any>()
  const [deleting, setDeleting] = useState(false)

  const [processingDownload, setProcessingDownload] = useState(false)

  type NewCodeData = Partial<{
    note: string
  }>
  const [newCodesData, _setNewCodesData] = useState<
    Record<string, NewCodeData | null>
  >({})
  const updateCode = (slug: string, newData: NewCodeData) => {
    _setNewCodesData((d) => ({
      ...d,
      [slug]: { ...(d[slug] || {}), ...newData },
    }))
  }
  const [codesSaving, setCodesSaving] = useState<Record<string, boolean>>({})

  const [_refreshTrigger, _setRefreshTrigger] = useState(0)
  const refreshQuest = () => _setRefreshTrigger(i => i + 1)
  useEffect(() => {
    if (user)
      axios
        .get<GetQuestResponse>('/api/quest/' + router.query.questId)
        .then((res) => {
          setQuestData(res.data.quest)
          if (res.data.notFound) {
            router.push('/quests')
            toast({
              title: `Quest ${router.query.questId} does not exist`,
              status: 'error',
            })
            return
          }
        })
  }, [user, _refreshTrigger])

  const deleteQuest = async () => {
    setDeleting(true)
    try {
      const res = await axios.post<DeleteResponse>(
        `/api/quest/${quest?.id}/delete`
      )
      if (res.data.deleted) {
        toast({
          title: 'Quest deleted succesfully',
        })
        router.push('/quests')
      }
    } catch (err) {
      console.error(err)
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const downloadAll = async () => {
    setProcessingDownload(true)
    const zip = new JSZip()

    for (const i in quest!.codes) {
      zip.file(`qr-${Number(i) + 1}-${quest!.codes[i].name || ''}.png`, quest!.codes[i].image.split(',')[1], {
        base64: true,
      })
    }

    const file = await zip.generateAsync({
      type: 'base64',
    })

    const a = document.createElement('a')
    a.href = 'data:application/zip;base64,' + file
    a.download = `qr-code-quest ${quest?.name}` // ZIP File name
    a.click() // Trigger the download

    setProcessingDownload(false)
    toast({
      title: 'Your QR codes are ready',
      status: 'success',
    })
  }

  const saveCode = async (slug: string) => {
    setCodesSaving((s) => ({ ...s, [slug]: true }))
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/updatecode`,
        {
          slug,
          newData: {
            note: newCodesData[slug]?.note,
          },
        }
      )
      _setNewCodesData((d) => ({ ...d, [slug]: null }))
      toast({
        title: 'Note published',
        status: 'success',
        duration: 1000
      })
    } catch (err) {
      console.error(err)
      toast({
        title: `Error saving note`,
        status: 'error',
      })
      // router.reload()
    } finally {
      setCodesSaving((s) => ({ ...s, [slug]: false}))
    }
  }

  const updateCodeName = async (slug: string, name: string) => {
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/updatecode`,
        {
          slug,
          newData: {
            name,
          },
        }
      )
      refreshQuest()
    } catch (err) {
      console.error(err)
      toast({
        title: `Error saving code title`,
        status: 'error',
      })
      // router.reload()
    }
  }

  const updateQuest = async (newData: { name?: string, enableConfetti?: boolean }) => {
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/update`,
        {
          newData
        }
      )
      // refreshQuest()
    } catch (err) {
      console.error(err)
      toast({
        title: `Error saving quest`,
        status: 'error',
      })
      // router.reload()
    }
  }

  return (
    <Layout>
      {!quest && (
        <>
          <Skeleton h="12" w="72" />
          <SkeletonText mt="12" noOfLines={6} spacing="4" />
          <Skeleton my="16" h="72" w="72" />
          <Skeleton my="20" h="72" w="72" />
        </>
      )}
      {quest && (
        <>
          <Meta title={quest.name} />
          <Link href="/quests">
            <Button leftIcon={<ArrowBackIcon />} variant={'link'}>
              My quests
            </Button>
          </Link>
          <Heading>{quest.name}</Heading>

          <Box my="12">
            <FormLabel display={'flex'} alignItems={'center'} gridGap={'2'}>
              <Switch defaultChecked={quest.enableConfetti} colorScheme="yellow" size="lg" onChange={e => {
                updateQuest({ enableConfetti: e.target.checked})
              }} />
              <Text as='span'>Enable Confetti</Text>
            </FormLabel>
          </Box>

          <Box my="12">
            <Button
              colorScheme="green"
              leftIcon={<AttachmentIcon />}
              onClick={downloadAll}
              isLoading={processingDownload}
            >
              Download all files
            </Button>
            <Stack
              spacing={'4'}
              my="4"
              divider={<StackDivider />}
              shadow={'xl'}
              p={'6'}
              rounded={'lg'}
              border="1px"
              borderColor={'gray.100'}
            >
              {quest.codes.map((c, i) => (
                <Flex gridGap={'6'} key={c.slug}>
                  <Image src={c.image} alt="QR Code" w={'44'} />
                  <Flex
                    w="full"
                    direction={'column'}
                    gridGap={'0.5'}
                    key={c.slug}
                  >
                    <Heading size={'md'} display={'flex'} alignItems={'center'}>
                      <Text as="span" color={'gray.400'} mr="2">
                        {i + 1}.
                      </Text>
                      <Editable
                        defaultValue={c.name || `Code ${i + 1}`}
                        onSubmit={(name) => updateCodeName(c.slug, name)}
                      >
                        <EditablePreview cursor={'pointer'} />
                        <EditableInput />
                      </Editable>
                    </Heading>
                    <a href={c.url + '/?testMode=1'} target={'_blank'}>
                      <Text fontSize={'xs'} color={'gray.400'}>
                        {c.url}
                      </Text>
                    </a>
                    <Text fontWeight={'bold'}>Total scans: {c.scans}</Text>

                    <Textarea
                      defaultValue={c.note || ''}
                      overflow={'scroll'}
                      w="full"
                      border={'none'}
                      focusBorderColor="none"
                      p="0"
                      size="sm"
                      rows={2}
                      placeholder="Leave a note for your hunters..."
                      resize={'none'}
                      onChange={(e) =>
                        updateCode(c.slug, { note: e.target.value })
                      }
                    />

                    <Spacer />
                    <Flex gridGap={'3'}>
                      <a
                        href={c.image}
                        download={`qr-code-quest-${quest.id}_${i + 1} ${c.name || ''}`}
                      >
                        <Button
                          colorScheme={'green'}
                          size="sm"
                          leftIcon={<DownloadIcon />}
                          onClick={() => {
                            toast({
                              title: 'Preparing download...',
                              status: 'info',
                              duration: 2000,
                            })
                          }}
                        >
                          Download
                        </Button>
                      </a>
                      {newCodesData[c.slug] && (
                        <Button
                          size="sm"
                          colorScheme={'orange'}
                          leftIcon={<CheckIcon />}
                          isLoading={codesSaving[c.slug]}
                          loadingText="Saving..."
                          onClick={() => saveCode(c.slug)}
                        >
                          Save
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          </Box>
          <Button
            colorScheme={'red'}
            variant={'ghost'}
            onClick={() => setDeleteOpen(true)}
          >
            Delete this quest
          </Button>
          <AlertDialog
            isOpen={deleteOpen}
            leastDestructiveRef={deleteCancelRef}
            onClose={() => setDeleteOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Quest
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure? All QR codes associated with this quest will
                  stop functioning, and you can't undo this.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    ref={deleteCancelRef}
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={deleteQuest}
                    ml={3}
                    isLoading={deleting}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}
    </Layout>
  )
}

export default QuestSettings
