import api from './api'

export async function uploadFile(file: File, userId: number): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ url: string }>(`/upload/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data.url
}
