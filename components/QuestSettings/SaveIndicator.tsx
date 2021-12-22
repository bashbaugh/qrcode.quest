import { Badge, Box, Spinner, Icon, Flex } from '@chakra-ui/react'
import { CheckIcon, WarningTwoIcon } from '@chakra-ui/icons'

const SaveIndicator: React.FC<{
  status: 'saving' | 'saved' | 'error'
}> = ({ status }) => {
  return (
    <Flex
      alignItems={'center'}
      gridGap={2}
      pos={'fixed'}
      bottom={3}
      left={3}
      backgroundColor={
        { saving: 'gray.50', saved: 'green.100', error: 'red.100' }[status]
      }
      borderRadius={'md'}
      p={1}
      shadow={'lg'}
    >
      {
        {
          saving: (
            <>
              <Spinner size="sm" /> Saving...
            </>
          ),
          saved: (
            <>
              <CheckIcon />
            </>
          ),
          error: (
            <>
              <WarningTwoIcon /> Error saving
            </>
          ),
        }[status]
      }
    </Flex>
  )
}

export default SaveIndicator
