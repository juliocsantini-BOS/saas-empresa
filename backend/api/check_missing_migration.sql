SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
FROM "_prisma_migrations"
WHERE migration_name = '20260303204051_drift_fix_requestid';