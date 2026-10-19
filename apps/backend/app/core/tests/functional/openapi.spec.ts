import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { generateDocument } from '@enzopita/adonisjs-openapi'
import type { OpenApiConfig } from '@enzopita/adonisjs-openapi/types'

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

    assert.deepEqual(warnings, [])
    assert.deepEqual(problems, [])
  }).timeout(20000)
})
