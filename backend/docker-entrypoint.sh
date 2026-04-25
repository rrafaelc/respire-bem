#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running Postgres seed..."
node dist/prisma/seed.js

echo "Running MongoDB seed..."
node dist/scripts/seed-mongo.js

echo "Starting server..."
exec ./node_modules/.bin/fastify start -l info -P -p 3001 -a 0.0.0.0 dist/src/app.js
