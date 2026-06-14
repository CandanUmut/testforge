# Security & Data Protection

TestForge is built for hardware and firmware teams that work on unreleased
products under NDA. Data protection is a first-class requirement, not an
afterthought. This document summarizes our security posture and how to report
issues.

## Reporting a vulnerability

Email **security@testforge.dev** with a description and reproduction steps.
We practice responsible disclosure: we will acknowledge your report promptly,
keep you updated on remediation, and credit you if you wish. Please do not open
public issues for security vulnerabilities.

## How your data is protected

**Tenant isolation.** Every record is scoped to an organization and enforced at
the database layer with PostgreSQL Row Level Security (RLS) — isolation is in the
data layer, not just the application. A row is only ever readable by the tenant
that owns it.

**Ingestion gateway.** External writes (CI, reporter, agent) go through a single
authenticated endpoint. It validates the API key, resolves the organization
**server-side**, and writes with a privileged role — clients can never set or
spoof an organization ID, so cross-tenant writes are structurally impossible.

**API key handling.**
- Keys are opaque `tf_` tokens; we store only a **SHA-256 hash**, never the
  plaintext.
- The full key is shown **once** at creation and cannot be retrieved again.
- Keys are **not readable** over the data API at all — even an org admin cannot
  select a key hash. They are managed only through audited RPCs.
- Keys are **scoped** to an organization, support **expiry**, and can be
  **revoked** instantly.

**Audit trail.** Security-relevant events (API key creation and revocation) are
written to an append-only `audit_events` log that members can read but cannot
modify, providing a tamper-evident record.

**Abuse limits.** The ingestion gateway enforces payload size and batch-size
caps to protect against resource-exhaustion abuse.

**Encryption.** All traffic is served over TLS (HTTPS). Data at rest is
encrypted by the managed database platform.

**Data minimization.** We collect only what is needed to run test operations:
test results, device health, and crash metadata. We **do not sell data** and we
**do not train external or shared AI models** on customer data.

**Your data, your control.** Data is exportable via the API at any time, and we
will permanently delete an organization's data on request. Enterprise
deployments can run **fully on-premise**, keeping all test and device data inside
your own network.

## Roadmap

- SOC 2 Type II
- Formal Data Processing Agreement (DPA) and sub-processor list
- Configurable data-retention windows
- SSO / SAML and SCIM provisioning
- Per-key read/write scopes surfaced in the dashboard

If you have a specific compliance requirement, contact us — we will tell you
plainly what we support today.
</content>
