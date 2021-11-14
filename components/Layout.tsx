import clsx from 'clsx'
import React from 'react'
import { Box } from '@chakra-ui/react'

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <div>
      <nav></nav>

      <Box maxW={'6xl'} mx='auto' p={{ base: '8', md: '32' }}>
        <main>{children}</main>
      </Box>

      <footer></footer>
    </div>
  )
}

export default Layout
