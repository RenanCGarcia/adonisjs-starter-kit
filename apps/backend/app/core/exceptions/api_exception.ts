import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Base of the app's expected failures. It handles itself, rather than leaving the body to the
 * handler's `renderErrorAsJSON()`, because the OpenAPI generator then documents the literal `code`
 * of each class under `@throws {ExceptionClass}` and under the middleware that throws it.
 */
export default class ApiException<Code extends string = string> extends Exception {
  declare code: Code

  toResponse() {
    return { code: this.code, message: this.message }
  }

  async handle(error: this, { response }: HttpContext) {
    response.status(error.status).send(error.toResponse())
  }
}
