import axios from 'axios'
import { AI_API_BASE_URL } from '@/config'

const aiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 120000
})

export async function polishDesignPrompt(prompt) {
  const response = await aiClient.post('/api/polish', { prompt })
  return response.data
}

export async function reviewDesignImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await aiClient.post('/api/openai_review', formData)
  return response.data
}
