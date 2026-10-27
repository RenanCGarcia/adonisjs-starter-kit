import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { generateDocument } from '@enzopita/adonisjs-openapi'
import type { OpenApiConfig } from '@enzopita/adonisjs-openapi/types'

type Schema = { $ref?: string; oneOf?: Schema[]; properties?: object; required?: string[] }

const VALIDATION_ERROR_REF = '#/components/schemas/ValidationError'

function isErrorBody(schema: Schema | undefined): boolean {
  if (!schema) return false

  if (schema.$ref) return schema.$ref === VALIDATION_ERROR_REF

  if (schema.oneOf) return schema.oneOf.every(isErrorBody)

  const keys = (names: Iterable<string>) => [...names].toSorted().join()

  return (
    keys(Object.keys(schema.properties ?? {})) === 'code,message' &&
    keys(schema.required ?? []) === 'code,message'
  )
}

test.group('Core | OpenAPI document', () => {
  test('documents every operation with a summary and a declared tag', async ({ assert }) => {
    const config = app.config.get<OpenApiConfig>('openapi')
    const { document, warnings } = await generateDocument(app, router, config)
    const declared = config.tags.map(tag => tag.name)

    const problems = Object.entries(document.paths).flatMap(([path, operations]) =>
      Object.entries(operations).flatMap(([method, operation]) => {
        const where = `${method.toUpperCase()} ${path}`
        const summary = operation.summary ?? ''

        return [
          ...(summary ? [] : [`${where}: no summary`]),
          ...(summary.length > 60 ? [`${where}: summary over 60 characters`] : []),
          ...(summary.endsWith('.') ? [`${where}: summary ends with a period`] : []),
          ...(operation.tags?.length === 1 && declared.includes(operation.tags[0]!)
            ? []
            : [`${where}: tags ${JSON.stringify(operation.tags)} are not one declared tag`]),
        ]
      }),
    )

    // Other specs register closure routes under /__tests/ on the shared router.
    assert.deepEqual(
      warnings.filter(warning => !warning.includes(' /__tests/')),
      [],
    )
    assert.deepEqual(problems, [])
  }).timeout(20000)

  test('answers every 4xx and 5xx with { code, message } or a validation error', async ({
    assert,
  }) => {
    const { document } = await generateDocument(
      app,
      router,
      app.config.get<OpenApiConfig>('openapi'),
    )

    const problems = Object.entries(document.paths).flatMap(([path, operations]) =>
      Object.entries(operations).flatMap(([method, operation]) =>
        Object.entries(operation.responses)
          .filter(([status]) => Number(status) >= 400)
          // The readiness probe answers 503 with the health report, not an error.
          .filter(([status]) => !(method === 'get' && path === '/health/ready' && status === '503'))
          .filter(([, response]) => !isErrorBody(response.content?.['application/json']?.schema))
          .map(([status]) => `${method.toUpperCase()} ${path} ${status}`),
      ),
    )

    assert.deepEqual(problems, [])
  }).timeout(20000)
})
