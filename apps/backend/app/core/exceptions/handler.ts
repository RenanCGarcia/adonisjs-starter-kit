import app from '@adonisjs/core/services/app'
import { Exception } from '@adonisjs/core/exceptions'
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected override debug = !app.inProduction

  /**
   * Translates an exception's message by its code (`errors.<code>`) in the request's locale,
   * keeping the original when no translation exists. Errors raised before the locale middleware
   * runs (an unknown route) have no `i18n` and stay in English.
   */
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- ExceptionHandler.handle receives whatever was thrown; the instanceof below narrows it.
  override async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof Exception && error.code && 'i18n' in ctx) {
      error.message = ctx.i18n.t(`errors.${error.code}`, {}, error.message)
    }

    return super.handle(error, ctx)
  }
}
