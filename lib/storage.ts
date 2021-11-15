import { getStorage, ref, uploadBytes, UploadResult } from 'firebase/storage'

const storage = getStorage()

const uploadImage = async (uid: string, name: string, file: Blob): Promise<UploadResult> => {
  const imageRef = ref(storage, `qr_image/${uid}/${name}`)

  const res = await uploadBytes(imageRef, file)

  return res
}
