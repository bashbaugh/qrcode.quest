import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import {
  Heading,
  Skeleton,
  SkeletonText,
  Box,
  Stack,
  Text,
  Button,
  Flex,
  StackDivider,
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
  Tooltip,
  useEditableControls,
  ButtonGroup,
  IconButton,
  NumberInput,
  NumberInputField,
  Select,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react'
import { useRequireAuth } from 'lib/hooks'
import { useRef, useState } from 'react'
import axios from 'lib/axios'
import { useToast } from 'lib/toast'
import {
  ArrowBackIcon,
  AttachmentIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons'
import Link from 'next/link'
import { CLAIM_CODE_LENGTH, DEFAULT_COMPLETION_NOTE } from 'pages/[code]'
import { Quest } from '@prisma/client'
import { zipAndDownloadB64Files } from 'lib/files'
import useQuest from 'lib/quest/useQuest'
import SaveIndicator from './SaveIndicator'
import QuestCode from './QuestCode'

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
  const {
    quest,
    deleteQuest,
    deleting,
    codesSaving,
    updateCode,
    questSaving,
    errorSaving,
    refreshQuest,
    updateQuest,
  } = useQuest()
  // const quest = state.quest
  const toast = useToast()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteCancelRef = useRef<any>()

  const [processingDownload, setProcessingDownload] = useState(false)

  type TempQuestData = Partial<{
    completionNote: string
  }>
  const [tempQuestData, setTempQuestData] = useState<TempQuestData | null>(null)

  const [claimCodeVal, setClaimCodeVal] = useState<string>()
  const [victoryType, setVictoryType] = useState<Quest['victoryFulfillment']>()

  const downloadAll = async () => {
    setProcessingDownload(true)

    const downloadList = quest!.codes.map((c, i) => ({
      name: `qr-${Number(i) + 1}-${c.name || 'code'}.png`,
      file: quest!.codes[i].image,
    }))

    await zipAndDownloadB64Files(downloadList, `qr-code-quest ${quest?.name}`)

    setProcessingDownload(false)
    toast({
      title: 'Your QR codes are ready',
      status: 'success',
    })
  }

  // TODO fix this
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
      <SaveIndicator
        status={errorSaving ? 'error' : questSaving ? 'saving' : 'saved'}
      />
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
            <a>
              <Button leftIcon={<ArrowBackIcon />} variant={'link'}>
                My quests
              </Button>
            </a>
          </Link>
          <Heading mb="4">
            <Editable
              display={'flex'}
              gridGap={'3'}
              alignItems={'center'}
              defaultValue={quest.name}
              isPreviewFocusable={false}
              onSubmit={(name) => updateQuest({ name })}
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
                        <Tr key={e.email}>
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
                    updateQuest({ enableQuest: e.target.checked })
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
                    updateQuest({ enableConfetti: e.target.checked })
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
                        None: There&apos;s no way to automatically track your
                        victors. You&apos;ll have to confirm manually that they
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
                  updateQuest({ victoryFulfillment: e.target.value as any })
                  setVictoryType(e.target.value as any)
                }}
              >
                <option value="NONE">Don&apos;t track quest completions</option>
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
                  setTempQuestData({ completionNote: e.target.value })
                }
              />
            </FormControl>

            {tempQuestData && (
              <div>
                <Button
                  colorScheme={'primary'}
                  onClick={() => {
                    updateQuest(tempQuestData).then(() =>
                      setTempQuestData(null)
                    )
                  }}
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
                <QuestCode
                  key={c.slug}
                  i={i}
                  c={c}
                  quest={quest}
                  saving={codesSaving[c.slug]}
                  updateCode={updateCode}
                />
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
                    You can&apos;t undo this.
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
