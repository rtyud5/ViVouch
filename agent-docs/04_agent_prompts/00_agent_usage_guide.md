# Agent Usage Guide

## 1. Intended tools
This documentation pack includes instruction files and prompts for:

- Antigravity with Gemini/Claude.
- Codex/ChatGPT coding agent.
- Cursor.
- OpenCode.
- GitHub Copilot.

## 2. How to use

### For repository-level agent context
Copy files from:

```text
agent_files/copy_to_repo/
```

into the actual project repository.

### For task prompting
Use files in `04_agent_prompts/` one by one.

Recommended order:

1. Bootstrap project.
2. Prisma schema.
3. Auth/RBAC.
4. Partner voucher.
5. Admin approval.
6. Customer checkout.
7. Partner redeem.
8. Dashboard/reports.
9. Tests/Swagger.
10. Code review.

## 3. Agent rules
Always tell the agent:

- Read `AGENTS.md` first.
- Do not change tech stack.
- Use JavaScript, not TypeScript.
- Use PostgreSQL + Prisma, not MongoDB.
- Keep business logic in service layer.
- Implement transaction/lock for checkout/redeem.
- Update Swagger and tests for business-critical APIs.

## 4. Recommended agent workflow

```text
Plan -> Implement small module -> Run tests -> Fix -> Commit -> Next module
```

Do not ask the agent to implement everything in one prompt.
