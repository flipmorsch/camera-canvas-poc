import { api } from '@/services/api'
export const getDownloadSignedUrl = async () => {
  try {
    const {
      data: { data },
    } = await api.get('/schedule/webapp/upload-signed-url', {
      params: {
        key: 'webapp/examples/teste.png',
        contentType: 'image/png',
      },
      headers: {
        'x-tenant-id': '01951519-724a-7525-b28e-6965ea09205c',
      },
    })
    return data
  } catch (error) {
    console.error('Error fetching schedule step', error)
    return null
  }
}
