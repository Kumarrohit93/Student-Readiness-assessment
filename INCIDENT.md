# Incident Investigation

## Summary

The incident involved duplicate assessment attempts, incorrect tenant data visibility and inconsistent event handling.

## Identified Failures

### 1. Missing Idempotency Constraint

The idempotency table did not have a unique constraint on tenant and idempotency key.

This allowed concurrent requests to create duplicate attempts.

### 2. Incorrect Cache Key

The cache key was changed from:

tenantId:status:page

to:

status

This allowed cached data from one tenant to be returned to another tenant.

### 3. MongoDB Failure Handling

MongoDB event publishing failed, but the error was caught and logged while the API still returned success.

This created a mismatch between relational state and operational events.

### 4. Readiness Calculation Race

Readiness was calculated by reading attempts in application code and then updating the current score.

Concurrent updates could therefore produce stale results.

### 5. Missing Indexes

Attempts were indexed only by student_id.

Queries for latest competency evidence require better indexing.

## Fixes Implemented

- Added unique constraint for tenant_id + idempotency_key.
- Added tenant-aware data access.
- Server derives tenant identity from authentication.
- Added optimistic concurrency using entity version.
- Added retry-safe Mongo event IDs.
- Added latest-attempt ordering using attempted_at and attempt ID.
- Added server-side filtering and stable sorting.

## Remaining Improvement

A durable outbox/event retry mechanism would provide stronger guarantees for MongoDB event delivery after a successful relational transaction.