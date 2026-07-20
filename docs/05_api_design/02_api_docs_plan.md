# Swagger/OpenAPI Maintenance Plan

## Source and publication

Swagger JSDoc annotations live beside routes; shared schemas live under `backend/src/docs`. Express exposes the generated document through `/api-docs`.

## Definition of Done for an API change

1. Route and method are documented.
2. Authentication role is declared.
3. Path/query/header/body schemas match Zod validation.
4. Success response includes status and payload shape.
5. Material error codes are listed.
6. Service and HTTP contract tests cover the critical path.
7. Requirement and demo documents are updated when behavior changes.

## Release validation

- Start a migrated/seeded backend.
- Open `/api-docs` and exercise health, login, catalog, checkout, redeem check/confirm, admin, and content routes.
- Compare generated paths with Express route inventory.
- Fail review on stale routes such as a documented endpoint that code does not expose.

The checked-in W4 redeem contract is superseded by the two-step route contract in the current source and this documentation.
