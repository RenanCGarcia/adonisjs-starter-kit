import app from '@adonisjs/core/services/app'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { Exception } from '@adonisjs/core/exceptions'
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected override debug = !app.inProduction

  /**
   * Translates an exception's message by its code (`errors.<code>`) in the request's locale,
   * keeping the original when no translation exists. Errors raised before the locale middleware
   * runs (an unknown route) have no `i18n` and stay in English.
   */
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- ExceptionHandler.handle receives whatever was thrown; the instanceof below narrows it.
  override async handle(error: unknown, ctx: HttpContext) {
    // ThrottleException renders itself by content negotiation, bypassing the { code, message }
    // shape every other error uses here; render it the same way instead of calling super.handle.
    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
      for (const [name, value] of Object.entries(error.getDefaultHeaders())) {
        ctx.response.header(name, value)
      }

      const message =
        'i18n' in ctx ? ctx.i18n.t('errors.E_TOO_MANY_REQUESTS', {}, error.message) : error.message

      return ctx.response.status(error.status).send({ code: error.code, message })
    }

    if (error instanceof Exception && error.code && 'i18n' in ctx) {
      error.message = ctx.i18n.t(`errors.${error.code}`, {}, error.message)
    }

    return super.handle(error, ctx)
  }
}
