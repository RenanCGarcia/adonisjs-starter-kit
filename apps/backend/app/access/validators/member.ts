import vine from '@vinejs/vine'
import { currentScope, inScope } from '#access/scope'
import { ASSIGNABLE_PERMISSIONS } from '#access/permissions'

const params = vine.object({ userId: vine.string().uuid() })

export const assignRoleValidator = vine.create({
  params,
  roleId: vine
    .string()
    .uuid()
    .exists({
      table: 'roles',
      column: 'id',
      filter: query => {
        inScope(query, currentScope(), 'roles')
      },
    })
    .nullable(),
})

export const replaceGrantsValidator = vine.create({
  params,
  permissions: vine.array(vine.enum(ASSIGNABLE_PERMISSIONS)).distinct(),
})
