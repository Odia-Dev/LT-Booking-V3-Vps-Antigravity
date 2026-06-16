# AI Development & Git Safety Rules

This document defines the strict operational rules and workflows for AI agents working on the Laxmi Toyota Platform V3 codebase.

---

## 1. Safety & Verification Workflow

Before reporting a task as complete, the AI agent must strictly perform the following steps:

1. **Verify Files on Disk**: Make sure all created or modified files physically exist in the local workspace.
2. **Lint Validation**: Run the code linting tool to verify there are no syntax or style violations:
   ```bash
   npm run lint
   ```
3. **Build Validation**: Run the Next.js build command to verify that the project compiles successfully:
   ```bash
   npm run build
   ```
4. **No Dealership Modules in Phase 1**: Never build dealership modules (vehicles, leads, booking systems, etc.) until the core authentication system is fully approved and complete.

---

## 2. Git & Deployment Rules

To prevent accidental overwrites, incorrect deployments, or bad merges, follow these constraints:

* **No Auto-Push**: Never push commits to GitHub automatically.
* **No Auto-Deploy**: Never deploy code to the Hostinger VPS directly or automatically.
* **Explicit Approval**: Every local commit or GitHub push requires explicit user approval.
* **Commit Schedule**: A mandatory local commit must be made after every successful phase of the roadmap.

### Verification Output Format

After implementing a phase or task, the AI agent must present the verification details to the user using the following format:

```text
Changes verified successfully.

Files changed:
- docs/AI_RULES.md (modified)
- ...

Build: PASS
Lint: PASS

Do you want me to:
A) Stop here
B) Commit locally only
C) Commit and push to GitHub
```

Wait for the user's manual selection before performing any Git actions.

---

## 3. Technology & Architecture Rules

* **Authentication**: Use a custom, single-admin HTTP-only cookie session mechanism.
  * **No** Better Auth.
  * **No** OAuth.
  * **No** session tables in the database.
  * Maintain session state entirely via cryptographically signed JWT or secure encrypted HTTP-only cookie containing admin status and expiration.
* **Database**: Always use Prisma ORM for database migrations and queries unless raw SQL is explicitly requested.
* **UI/UX Aesthetics**: Keep UI state interactive, modern, and high-fidelity with shadcn/ui and Tailwind CSS. Avoid placeholders.
