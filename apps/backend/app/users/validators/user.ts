import vine from '@vinejs/vine'
import { supportedLocales } from '#config/i18n'

/** Every IANA zone name, plus `UTC`, built once at import time instead of per request. */
const timeZones = Intl.supportedValuesOf('timeZone').concat('UTC')

export const localeRule = () => vine.enum(supportedLocales)
export const timezoneRule = () => vine.enum(timeZones)

export const updateAvatarValidator = vine.create({
  attachmentId: vine.string().uuid().nullable(),
})

/** Partial: a request sends either field or both, never neither. */
export const updateProfileValidator = vine.create({
  locale: localeRule().optional().requiredIfMissing('timezone'),
  timezone: timezoneRule().optional().requiredIfMissing('locale'),
})
