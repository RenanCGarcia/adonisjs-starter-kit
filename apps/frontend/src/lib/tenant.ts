import { getRouteApi } from '@tanstack/react-router'

const appRoute = getRouteApi('/_app')
const tenantRoute = getRouteApi('/_app/t/$tenantId')

/**
 * The workspace a /t/$tenantId page renders: its id from the URL, the signed-in user's
 * permissions in it, and its record from the workspace list (missing only while that list reloads).
 */
export function useTenant() {
  const { tenantId } = tenantRoute.useParams()
  const { permissions } = tenantRoute.useRouteContext()
  const { tenants } = appRoute.useLoaderData()

  return { tenantId, permissions, tenant: tenants.find(tenant => tenant.id === tenantId) }
}
