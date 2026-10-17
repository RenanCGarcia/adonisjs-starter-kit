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

/** Request options that scope a call to one workspace: spread into any tenant route's arguments. */
export function tenantHeaders(tenantId: string) {
  return { headers: { 'X-Tenant-Id': tenantId } }
}
