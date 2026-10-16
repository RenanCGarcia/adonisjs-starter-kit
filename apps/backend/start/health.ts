import db from '@adonisjs/lucid/services/db'
import { DbCheck, DbConnectionCountCheck } from '@adonisjs/lucid/database'
import { StorageCheck } from '#core/health_checks/storage_check'
import {
  HealthChecks,
  DiskSpaceCheck,
  MemoryHeapCheck,
  MemoryRSSCheck,
} from '@adonisjs/core/health'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck().cacheFor('1 hour'),
  new MemoryHeapCheck(),
  new MemoryRSSCheck(),
  new DbCheck(db.connection()),
  // Counts every backend on the server (pg_stat_activity), not just this app's pool, so the
  // thresholds sit below Postgres' default max_connections of 100.
  new DbConnectionCountCheck(db.connection()).warnWhenExceeds(70).failWhenExceeds(90),
  new StorageCheck(),
])
