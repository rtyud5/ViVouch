# Contributing Guide

## Branch Strategy

- `main`: production-ready branch, receives merges from feature branches
- `feature/<task-id>`: each assigned task gets its own branch

Examples:
- `feature/T1.4-auth-api`
- `feature/T2.1-customer-voucher`
- `feature/T3.3-admin-dashboard`

## Workflow

1. Get assigned a task, then create a branch from `main`: `git checkout -b feature/T1.4-auth-api`
2. Code and commit frequently on your own branch.
3. Push the branch and open a Pull Request into `main`.
4. The PR is automatically reviewed by **Gemini Bot**, **CodeRabbit**, and **SonarQube**.
5. Self-review your code based on bot feedback and push fixes as needed.
6. Optionally request a team member review if needed.
7. Merge into `main` once all bot checks pass.
