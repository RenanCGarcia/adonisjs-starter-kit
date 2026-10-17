import { registry } from '@monorepo/backend/registry'
import { createTuyau } from '@tuyau/core/client'
import { createTuyauReactQueryClient } from '@tuyau/react-query'
import { locale } from '@/features/core/i18n'
import { session } from '@/features/core/session'

const client = createTuyau({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  registry,
  hooks: {
    beforeRequest: [
      request => {
        const token = session.token()

        request.headers.set('Accept-Language', locale)

        if (token) request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
  },
})

export const api = client.api

export const queries = createTuyauReactQueryClient({ client })

/** Tuyau keys a query by its whole request, header included, so each workspace caches apart. */
export function tenantHeaders(tenantId: string) {
  return { headers: { 'X-Tenant-Id': tenantId } }
}
