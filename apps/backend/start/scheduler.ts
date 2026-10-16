import PruneAttachmentsJob from '#attachments/jobs/prune_attachments'

await PruneAttachmentsJob.schedule({}).cron('0 3 * * *')
