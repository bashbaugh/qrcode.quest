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
  FormControl,
  FormHelperText,
  Tooltip,
  useEditableControls,
  ButtonGroup,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
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
  CloseIcon,
  DownloadIcon,
  EditIcon,
  InfoIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons'
import JSZip from 'jszip'
import Link from 'next/link'
import { UpdateQuestCodeResponse } from 'pages/api/quest/[slug]/updatecode'
import { CLAIM_CODE_LENGTH, DEFAULT_COMPLETION_NOTE } from 'pages/[code]'
import { Quest } from '@prisma/client'
import { BsCardImage } from 'react-icons/bs'

function TitleControls() {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls()

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm">
      <IconButton
        variant={'unstyled'}
        icon={<CheckIcon />}
        {...(getSubmitButtonProps() as any)}
      />
      <IconButton
        variant={'unstyled'}
        icon={<CloseIcon />}
        {...(getCancelButtonProps() as any)}
      />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton
        variant={'unstyled'}
        size="sm"
        icon={<EditIcon />}
        {...(getEditButtonProps() as any)}
      />
    </Flex>
  )
}

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

  const  = useRef()

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

  type NewQuestData = Partial<{
    completionNote: string
  }>
  const [newQuestData, updateQuest] = useState<NewQuestData | null>(null)
  const [questSaving, setQuestSaving] = useState<boolean>(false)

  const [claimCodeVal, setClaimCodeVal] = useState<string>()
  const [victoryType, setVictoryType] = useState<Quest['victoryFulfillment']>()

  const [_refreshTrigger, _setRefreshTrigger] = useState(0)
  const refreshQuest = () => _setRefreshTrigger((i) => i + 1)
  useEffect(() => {
    if (user)
      axios
        .get<GetQuestResponse>('/api/quest/' + router.query.questId)
        .then((res) => {
          setQuestData(res.data.quest)
          setVictoryType(res.data.quest?.victoryFulfillment)
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
      zip.file(
        `qr-${Number(i) + 1}-${quest!.codes[i].name || ''}.png`,
        quest!.codes[i].image.split(',')[1],
        {
          base64: true,
        }
      )
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
        duration: 1000,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: `Error saving note`,
        status: 'error',
      })
      // router.reload()
    } finally {
      setCodesSaving((s) => ({ ...s, [slug]: false }))
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

  const saveQuest = async (newData?: {
    name?: string
    enableConfetti?: boolean
    enableQuest?: boolean
    victoryFulfillment?: Quest['victoryFulfillment']
  }) => {
    setQuestSaving(true)
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/update`,
        {
          newData: {
            ...newData,
            ...newQuestData,
          },
        }
      )
      // refreshQuest()
      updateQuest(null)
    } catch (err) {
      console.error(err)
      toast({
        title: `Error saving quest`,
        status: 'error',
      })
      // router.reload()
    } finally {
      setQuestSaving(false)
    }
  }

  const checkClaimCode = () => {
    const code = quest!.claimCodes.find(
      (c) => c.code === parseInt(claimCodeVal!)
    )

    if (code && !code.claimed) {
      toast({
        title: `That's a valid code`,
        status: 'success',
        duration: 2000,
      })

      axios.post('/api/markclaimed', {
        codeId: code.id,
      })
    } else if (code) {
      toast({
        title: `That's a valid code, but it's already been claimed`,
        status: 'warning',
        duration: 2000,
      })
    } else {
      toast({
        title: `That code isn't valid`,
        status: 'warning',
        duration: 2000,
      })
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
          <Heading mb="4">
            <Editable
              display={'flex'}
              gridGap={'3'}
              alignItems={'center'}
              defaultValue={quest.name}
              isPreviewFocusable={false}
              onSubmit={(name) => saveQuest({ name })}
            >
              <EditablePreview />
              <EditableInput />
              <TitleControls />
            </Editable>
          </Heading>

          <Flex
            my="8"
            direction={'column'}
            p="4"
            gridGap={'4'}
            rounded="lg"
            backgroundColor={'gray.50'}
            shadow={'lg'}
          >
            <Text fontWeight={'bold'}>
              {quest.completionsCount}{' '}
              {quest.completionsCount === 1 ? 'person has' : 'people have'}{' '}
              completed this quest
            </Text>
            {victoryType === 'CLAIM_CODE' && (
              <Flex gridGap={'4'} alignItems={'center'}>
                <Text>Check a completion code:</Text>
                <NumberInput
                  maxW={'32'}
                  precision={0}
                  max={99_999}
                  min={0}
                  // ref={claimCodeInputRef}
                  onChange={(v) => setClaimCodeVal(v)}
                  on
                  variant={'flushed'}
                >
                  <NumberInputField placeholder="00340" />
                </NumberInput>
                <Button
                  size="sm"
                  colorScheme={'green'}
                  disabled={
                    claimCodeVal?.replace('-', '')?.length !== CLAIM_CODE_LENGTH
                  }
                  onClick={checkClaimCode}
                >
                  Mark claimed
                </Button>
              </Flex>
            )}
            {victoryType === 'COLLECT_EMAIL' && (
              <>
                <Heading size="md">Victors</Heading>
                {!quest.claimEmails.length && (
                  <Text fontSize={'sm'}>No emails collected yet.</Text>
                )}
                {quest.claimEmails.length ? (
                  <Table size="sm" maxH="44" overflowY={'auto'}>
                    <Thead>
                      <Tr>
                        <Th>Email</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {quest.claimEmails.map((e) => (
                        <Tr>
                          <Td>{e.email}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : null}
              </>
            )}
          </Flex>

          <Flex my="8" direction={'column'} gridGap={'4'}>
            <Flex gridGap={'5'}>
              <FormControl>
                <FormLabel>
                  <Tooltip
                    placement="auto-end"
                    label="Allow questers to scan your QR codes"
                  >
                    <Text
                      as="span"
                      display={'inline-flex'}
                      alignItems={'center'}
                      gridGap={'1'}
                    >
                      Enable Quest <InfoOutlineIcon />
                    </Text>
                  </Tooltip>
                </FormLabel>
                <Switch
                  defaultChecked={quest.enableQuest}
                  colorScheme="primary"
                  size="lg"
                  onChange={(e) => {
                    saveQuest({ enableQuest: e.target.checked })
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <Tooltip
                    placement="auto-end"
                    label="Show animated confetti to your questers when they reach the final code"
                  >
                    <Text
                      as="span"
                      display={'inline-flex'}
                      alignItems={'center'}
                      gridGap={'1'}
                    >
                      Enable Confetti <InfoOutlineIcon />
                    </Text>
                  </Tooltip>
                </FormLabel>
                <Switch
                  defaultChecked={quest.enableConfetti}
                  colorScheme="primary"
                  size="lg"
                  onChange={(e) => {
                    saveQuest({ enableConfetti: e.target.checked })
                  }}
                />
              </FormControl>
            </Flex>

            <FormControl>
              <FormLabel>
                <Tooltip
                  placement="auto-end"
                  label={
                    <>
                      <p>
                        Claim codes: give questers a unique code when they scan
                        the last QR code that you can use to verify that they
                        completed it.
                      </p>
                      <p>
                        Collect emails: Ask users for their emails, which will
                        then be shared with you.
                      </p>
                      <p>
                        None: There's no way to automatically track your
                        victors. You'll have to confirm manually that they
                        completed the quest by having them scan one of the
                        codes.
                      </p>
                    </>
                  }
                >
                  <Text
                    as="span"
                    display={'inline-flex'}
                    alignItems={'center'}
                    gridGap={'1'}
                  >
                    Victory tracking method <InfoOutlineIcon />
                  </Text>
                </Tooltip>
              </FormLabel>
              <Select
                defaultValue={quest.victoryFulfillment}
                onChange={(e) => {
                  saveQuest({ victoryFulfillment: e.target.value as any })
                  setVictoryType(e.target.value as any)
                }}
              >
                <option value="NONE">Don't track quest completions</option>
                <option value="CLAIM_CODE">Claim codes</option>
                <option value="COLLECT_EMAIL">Collect emails</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>
                <Tooltip
                  placement="auto-end"
                  label="Leave a note that will be displayed to your questers when they
                find the last codes. WILL override any note set on the QR code."
                >
                  <Text
                    as="span"
                    display={'inline-flex'}
                    alignItems={'center'}
                    gridGap={'1'}
                  >
                    Completion Note <InfoOutlineIcon />
                  </Text>
                </Tooltip>
              </FormLabel>
              <Textarea
                defaultValue={quest.completionNote || ''}
                placeholder={DEFAULT_COMPLETION_NOTE}
                resize={'none'}
                onChange={(e) =>
                  updateQuest({ completionNote: e.target.value })
                }
              />
            </FormControl>

            {newQuestData && (
              <div>
                <Button
                  colorScheme={'primary'}
                  onClick={() => saveQuest()}
                  isLoading={questSaving}
                  loadingText="Saving..."
                >
                  Save
                </Button>
              </div>
            )}
          </Flex>

          <Box my="12">
            <Button
              colorScheme="primary"
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
                <Box w='full'>
                <Flex w='full' gridGap={'6'} key={c.slug}>
                  <Image src={c.image} alt="QR Code" w={'44'} />
                  <Flex
                    w="full"
                    direction={'column'}
                    gridGap={'0.5'}
                    key={c.slug}
                    flex={'1 0 0px'}
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
                      placeholder="Leave a note for your questers..."
                      resize={'none'}
                      onChange={(e) =>
                        updateCode(c.slug, { note: e.target.value })
                      }
                    />

                    <Spacer />
                    <Flex gridGap={'3'}>
                      <a
                        href={c.image}
                        download={`qr-code-quest-${quest.id}_${i + 1} ${
                          c.name || ''
                        }`}
                      >
                        <Button
                          colorScheme={'primary'}
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
                          colorScheme={'secondary'}
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
                  <Flex
                    direction={'column'}
                    gridGap={'1'}
                    key={c.slug}
                    flex='0 1 0px'
                    p='1'
                    rounded={'lg'}
                    border='1px'
                    borderColor={'gray.100'}
                    alignSelf={'center'}
                  >
                    <input style={{ width: 0, height: 0, visibility: 'hidden' }} ref={uploadRe} />
                    <IconButton variant={'ghost'} aria-label='Upload Image' icon={<BsCardImage />} />
                  </Flex>
                </Flex></Box>
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
                  <Text>
                    Are you sure? All QR codes associated with quest{' '}
                    <Text
                      as="span"
                      fontWeight={'bold'}
                      borderRadius={'sm'}
                      p="1"
                      backgroundColor={'red'}
                      color="white"
                    >
                      {quest.name}
                    </Text>{' '}
                    will stop functioning.
                  </Text>

                  <Text my="2" fontWeight={'bold'}>
                    You can't undo this.
                  </Text>
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
