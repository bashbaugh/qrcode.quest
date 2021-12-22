import clsx from 'clsx'
import React from 'react'
import { Box, Link } from '@chakra-ui/react'

const Layout: React.FC<{ showFooter?: boolean }> = ({ children, showFooter }) => {
  return (
    <div>
      <nav></nav>

      <Box maxW={'6xl'} mx="auto" p={{ base: '8', md: '32' }}>
        <main>{children}</main>
      </Box>

      {showFooter && <Box as='footer' textAlign={'center'} p={1} borderTop={'1px'} borderColor={'gray.100'} fontSize={'0.9em'} color={'gray.600'}>A project by <Link href='https://benjaminashbaugh.me/'>@bashbaugh</Link></Box>}
    </div>
  )
}

export default Layout
