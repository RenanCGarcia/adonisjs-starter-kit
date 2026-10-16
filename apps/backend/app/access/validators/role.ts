import vine from '@vinejs/vine'
import { currentScope, inScope } from '#access/scope'
import { ASSIGNABLE_PERMISSIONS } from '#access/permissions'

const params = vine.object({ id: vine.string().uuid() })

const permissions = vine.array(vine.enum(ASSIGNABLE_PERMISSIONS)).distinct()

const name = vine.string().trim().minLength(1).maxLength(255)

export const createRoleValidator = vine.create({
  name: name.clone().unique({
    table: 'roles',
    column: 'name',
    filter: query => {
      inScope(query, currentScope(), 'roles')
    },
  }),
  permissions,
})

export const updateRoleValidator = vine.create({
  params,
  name: name.clone().unique({
    table: 'roles',
    column: 'name',
    filter: (query, _, field) => {
      inScope(query, currentScope(), 'roles').whereNot('id', field.data.params.id)
    },
  }),
  permissions,
})

export const roleParamsValidator = vine.create({ params })
