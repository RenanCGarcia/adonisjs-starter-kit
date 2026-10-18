import PruneAttachmentsJob from '#attachments/jobs/prune_attachments'
import PruneAuditEventsJob from '#audit/jobs/prune_audit_events'
import PruneExpiredTokensJob from '#auth/jobs/prune_expired_tokens'

await PruneAttachmentsJob.schedule({}).cron('0 3 * * *')

await PruneAuditEventsJob.schedule({}).cron('30 3 * * *')

await PruneExpiredTokensJob.schedule({}).cron('15 3 * * *')
