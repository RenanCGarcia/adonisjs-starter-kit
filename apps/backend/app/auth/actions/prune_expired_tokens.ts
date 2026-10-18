import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'

const BATCH_SIZE = 1000

/**
 * Deletes expired rows from `auth_access_tokens` (the sliding 30-day idle timeout, and
 * impersonation's own 1-hour cap) and `user_tokens` (single-use emailed tokens), in batches,
 * then records how many of each it deleted. Safe to run twice, concurrently, or after a crash:
 * a run skips the rows another one has locked, and a second run finds nothing left to delete.
 */
export default class PruneExpiredTokens {
  async handle() {
    await backfillMissingExpiry()

    const accessTokens = await pruneTable('auth_access_tokens')
    const userTokens = await pruneTable('user_tokens')

    if (accessTokens > 0 || userTokens > 0) {
      await audit.note('auth.tokens_pruned', {
        tenantId: null,
        subject: null,
        data: { accessTokens, userTokens },
      })
    }

    return { accessTokens, userTokens }
  }
}

/**
 * A session created by code older than the idle timeout has no expiry, which reads as "never".
 * The migration that introduced it backfilled the rows it saw; this catches any created after it
 * ran, so an unused one still expires and gets pruned.
 */
async function backfillMissingExpiry() {
  await db.rawQuery(`
    UPDATE auth_access_tokens
    SET expires_at = COALESCE(last_used_at, created_at) + INTERVAL '30 days'
    WHERE expires_at IS NULL AND impersonator_id IS NULL
  `)
}

async function pruneTable(table: string) {
  let deleted = 0

  while (true) {
    const { rowCount } = await db.rawQuery<{ rowCount: number }>(
      `
      DELETE FROM ${table} WHERE id IN (
        SELECT id FROM ${table} WHERE expires_at IS NOT NULL AND expires_at < now()
        ORDER BY expires_at LIMIT :limit FOR UPDATE SKIP LOCKED
      )
      `,
      { limit: BATCH_SIZE },
    )

    deleted += rowCount

    if (rowCount < BATCH_SIZE) break
  }

  return deleted
}
