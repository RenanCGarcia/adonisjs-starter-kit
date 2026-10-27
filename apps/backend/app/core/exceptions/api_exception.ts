import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Base of the app's expected failures. Self-handling sends `{ code, message }` in production too,
 * where the default renderer sends only `message`, and gives `@throws {ExceptionClass}` its body.
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
