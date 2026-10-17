import Invitation from '#access/models/invitation'

export interface RevokeInvitationInput {
  id: string
}

export default class RevokeInvitation {
  async handle({ id }: RevokeInvitationInput) {
    const invitation = await Invitation.findOrFail(id)

    await invitation.delete()
  }
}
