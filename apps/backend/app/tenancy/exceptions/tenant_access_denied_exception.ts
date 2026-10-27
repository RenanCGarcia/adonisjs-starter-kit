import ApiException from '#core/exceptions/api_exception'

export default class TenantAccessDeniedException extends ApiException<'E_TENANT_ACCESS_DENIED'> {
  static override status = 403
  static override code = 'E_TENANT_ACCESS_DENIED'
  static override message = 'Not a member of the tenant'
}
