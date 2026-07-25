import { post } from './client'

export function registerUser(payload) {
  return post('/api/auth/register', payload)
}

export function registerMerchant(payload) {
  return post('/api/merchant/register', payload)
}
