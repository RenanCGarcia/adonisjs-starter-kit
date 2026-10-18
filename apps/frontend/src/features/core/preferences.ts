import { z } from 'zod'
import { useStore } from 'zustand'
import { createPersistedStore } from '@/features/core/persisted-store'
import { LOCALES } from '@/features/core/locales'
import type { Locale } from '@/features/core/locales'

/**
 * The language and time zone the account is known to use, mirrored from the profile. A reload
 * before the profile loads already renders in the right language and zone.
 */
export const preferencesStore = createPersistedStore(
  'starter:preferences',
  z.object({
    locale: z.enum(LOCALES).nullable(),
    timeZone: z.string().min(1).nullable(),
  }),
  { locale: null, timeZone: null },
)

export const preferences = {
  locale: () => preferencesStore.getState().locale,
  timeZone: () => preferencesStore.getState().timeZone,
  set: (next: { locale?: Locale; timeZone?: string }) =>
    preferencesStore.setState(current => ({ ...current, ...next })),
}

/** The active time zone, re-rendering a component when it changes. `undefined` defers to the runtime's own. */
export function useTimeZone(): string | undefined {
  return useStore(preferencesStore, state => state.timeZone ?? undefined)
}
