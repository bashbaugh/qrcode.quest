import { useRouter } from 'next/router'
import { useToast } from '@chakra-ui/react'
import { useGlobalState } from './state'
import { useEffect, useRef } from 'react'

export const useRequireAuth = () => {
  const user = useGlobalState((s) => s.user)
  const router = useRouter()
  const toast = useToast({ position: 'top' })
  const wasSignedInRef = useRef<boolean>(false)

  useEffect(() => {
    if (user === null && !wasSignedInRef.current) {
      router.replace('/signin')
      toast({
        title: 'Please sign in first',
        status: 'warning',
      })
    }
    if (user) wasSignedInRef.current = true
  }, [user])
}
