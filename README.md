# Student Readiness Control Center

## Overview

A multi-tenant Student Readiness Control Center for tracking student competency attempts and readiness.

## Tech Stack

- React
- JavaScript
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- MongoDB
- JWT

## Features

- Authentication
- Tenant isolation
- Role-based access control
- Student management
- Competency assessment
- Weighted readiness calculation
- Idempotent attempt submission
- Optimistic concurrency
- Search, filtering, sorting and pagination
- MongoDB activity events
- Dashboard statistics
- Standardized error responses

## Competencies

- Frontend — 30%
- Backend — 30%
- Databases — 25%
- Problem Solving — 15%

## Readiness Rules

- 80+ → READY
- 65–79.99 → NEARLY_READY
- 50–64.99 → DEVELOPING
- Below 50 → NEEDS_PREPARATION
- Missing competency → INCOMPLETE

## Setup

### Backend

```bash
cd Backend
npm install
npm run dev
