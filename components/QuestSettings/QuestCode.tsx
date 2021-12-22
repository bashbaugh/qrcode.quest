import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  DownloadIcon,
} from '@chakra-ui/icons'
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  IconButton,
  Image,
  Spacer,
  Text,
  Textarea,
} from '@chakra-ui/react'
import useQuest from 'lib/quest/useQuest'
import { useToast } from 'lib/toast'
import { QuestCodeData, QuestData } from 'pages/api/quest/[slug]'
import { useState } from 'react'

const QuestCode: React.FC<{
  quest: QuestData
  /** code data */
  c: QuestCodeData
  /** code index */
  i: number
  saving: boolean
  updateCode: ReturnType<typeof useQuest>['updateCode']
}> = ({ updateCode, c, i, quest, saving }) => {
  const toast = useToast()
  const [tempCodeData, setTempCodeData] = useState<Partial<{
    note: string
  }> | null>(null)

  return (
    <Box w="full" key={c.slug}>
      <Flex w="full" gridGap={'6'} key={c.slug} direction={{ base: 'column', sm: 'row'}}>
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
              onSubmit={(name) => updateCode(c.slug, { name })}
            >
              <EditablePreview cursor={'pointer'} />
              <EditableInput />
            </Editable>
          </Heading>
          {/* eslint-disable-next-line react/jsx-no-target-blank */}
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
            onChange={(e) => setTempCodeData({ note: e.target.value })}
          />

          <Spacer />
          <Flex gridGap={'3'}>
            <a
              href={c.image}
              download={`qr-code-quest-${quest.id}_${i + 1} ${c.name || ''}`}
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
            {tempCodeData && (
              <Button
                size="sm"
                colorScheme={'secondary'}
                leftIcon={<CheckIcon />}
                isLoading={saving}
                loadingText="Saving..."
                onClick={() => {
                  updateCode(c.slug, tempCodeData).then(() =>
                    setTempCodeData(null)
                  )
                }}
              >
                Save
              </Button>
            )}
          </Flex>
        </Flex>
        {/* <Flex
          direction={'column'}
          gridGap={'1'}
          key={c.slug}
          flex="0 1 0px"
          p="1"
          rounded={'lg'}
          border="1px"
          borderColor={'gray.100'}
          alignSelf={'center'}
        >
          {/* <input style={{ width: 0, height: 0, visibility: 'hidden' }} ref={uploadInputRef} />
          {/* <IconButton variant={'ghost'} aria-label='Upload Image' icon={<BsCardImage />} onClose={} />
          <IconButton
            variant={'ghost'}
            aria-label="Delete"
            icon={<ChevronUpIcon />}
          />
          <IconButton
            variant={'ghost'}
            aria-label="Delete"
            icon={<DeleteIcon />}
          />
          <IconButton
            variant={'ghost'}
            aria-label="Delete"
            icon={<ChevronDownIcon />}
          />
        </Flex> */}
      </Flex>
    </Box>
  )
}

export default QuestCode
