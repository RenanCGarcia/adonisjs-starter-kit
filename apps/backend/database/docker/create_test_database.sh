#!/bin/sh
# Runs once, on the volume's first boot. Must match DB_DATABASE in .env.test.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE \"${POSTGRES_DB}_test\""
