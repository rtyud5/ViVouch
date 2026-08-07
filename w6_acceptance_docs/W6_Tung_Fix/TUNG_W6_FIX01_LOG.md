# TUNG-W6-FIX-01 — Evidence Link Repair Log

**Task:** Repair portable evidence links  
**Scope:** W6 documentation only  
**Status:** Closed by re-check on 2026-08-07

## Change made

The original repair log embedded a raw diff containing obsolete absolute local Markdown links. Although those links were shown as historical removed lines, the repository evidence validator correctly parses Markdown syntax inside that diff and therefore failed the CI evidence job.

This revised log retains the audit conclusion without reproducing invalid link syntax. All actual documentation links must be repository-relative targets only. The validator is the source of truth for this rule.

## Verification

```text
Command: node scripts/verify-evidence.mjs
Expected: exit code 0; no local-path or broken-link finding
Scope: w5_acceptance_docs/W5D5 and w6_acceptance_docs
Observed exit code: 0
Observed stdout: Evidence validation passed: 78 files checked.
Observed stderr: (none)
Frozen candidate SHA: 6c542363d1beeebf6173988ef9cac15c3dae40cb
```

## Corrective action assessment

| Finding | Cause | Corrective action | Result |
|---|---|---|---|
| Evidence validation failed | Historical diff used parsable obsolete local Markdown links | Remove the raw diff and retain a text-only explanation | Resolved |
| Evidence links were machine-specific | Links previously used an author-machine path | Use repository-relative targets only | Enforced by validator |

## Remaining rule

Do not paste raw invalid Markdown links into evidence logs, including inside a diff example. If an invalid format must be discussed, describe it in plain language rather than using link syntax.
