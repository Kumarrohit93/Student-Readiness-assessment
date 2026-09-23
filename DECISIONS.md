# Architecture Decisions

## 1. PostgreSQL as Source of Truth

PostgreSQL is used for tenants, users, students, competencies, attempts and idempotency records.

### Why?

These entities require relational consistency and transactional behavior.

MongoDB is used for operational activity events.

---

## 2. JWT Authentication

JWT is used to authenticate organisation users.

The server derives the tenant ID from the authenticated JWT instead of trusting a tenant ID supplied by the client.

### Trade-off

JWT keeps the implementation simple for the assessment, while a production system could use a more advanced session/token management strategy.

---

## 3. Idempotency Keys

Attempt creation requires an Idempotency-Key.

A unique constraint on tenant_id + idempotency_key prevents duplicate logical requests.

### Trade-off

This adds database storage and transaction complexity, but prevents duplicate assessment attempts when clients retry requests.

---

## Deferred Improvement

A production version could introduce a dedicated durable event/outbox processing mechanism for stronger MongoDB event delivery guarantees after PostgreSQL commits.