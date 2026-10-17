import { registry } from '@monorepo/backend/registry'
import { createTuyau } from '@tuyau/core/client'
import { auth } from '@/lib/auth'

export const client = createTuyau({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  registry,
  hooks: {
    beforeRequest: [
      request => {
        const token = auth.getToken()

        if (token) request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
  },
})

export const api = client.api

export function tenantHeaders(tenantId: string) {
  return { headers: { 'X-Tenant-Id': tenantId } }
}
