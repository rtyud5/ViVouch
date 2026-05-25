# Documentation Index

## 01_project_requirements
Files derived from the BRD. These explain the assignment requirements, business requirements, constraints, risks, acceptance criteria, and traceability.

1. `01_brd_source_extraction.md` — full extraction of BRD content into structured developer/agent format.
2. `02_business_scope_and_goals.md` — business context, opportunity, goals, project boundaries.
3. `03_roles_and_permissions.md` — customer, partner, admin responsibilities and RBAC matrix.
4. `04_business_requirements_matrix.md` — BR, BR-CUS, BR-PAR, BR-ADM requirements mapped to modules.
5. `05_business_rules_and_lifecycle.md` — business rules RB-01..RB-15 and status state machines.
6. `06_data_requirements_and_domain_entities.md` — data groups and domain model entities.
7. `07_nfr_assumptions_constraints_risks.md` — non-functional requirements, assumptions, constraints, risks.
8. `08_kpi_acceptance_deliverables.md` — success KPIs, acceptance criteria, deliverables.
9. `09_traceability_matrix.md` — requirement-to-module/API/DB/test mapping.
10. `10_demo_script_and_seed_data.md` — demo scenario and required seed data.

## 02_tech_stack
Final selected technology stack and how each technology is used.

1. `01_final_stack_decision.md`
2. `02_frontend_stack_spec.md`
3. `03_backend_stack_spec.md`
4. `04_database_prisma_postgresql_spec.md`
5. `05_testing_api_docs_deploy_spec.md`
6. `06_repository_folder_structure.md`
7. `07_package_list_and_commands.md`

## 03_architecture_design
Technical architecture, design patterns, consistency, locking, caching, security, API, database, testing, and deployment design.

1. `01_architecture_overview.md`
2. `02_modular_monolith_module_map.md`
3. `03_design_patterns.md`
4. `04_state_machines.md`
5. `05_consistency_transactions_locks.md`
6. `06_cache_rate_limit_idempotency.md`
7. `07_security_rbac_auth.md`
8. `08_error_logging_audit_observability.md`
9. `09_rest_api_contracts.md`
10. `10_database_design_prisma_guide.md`
11. `11_frontend_architecture_ui_ux.md`
12. `12_testing_strategy.md`
13. `13_deployment_env_and_operations.md`
14. `14_mvp_phase_plan.md`

## 04_agent_prompts
Vibe-coding prompts and step-by-step tasks for AI agents.

1. `00_agent_usage_guide.md`
2. `01_project_bootstrap_prompt.md`
3. `02_database_prisma_prompt.md`
4. `03_auth_rbac_prompt.md`
5. `04_partner_voucher_prompt.md`
6. `05_admin_approval_prompt.md`
7. `06_customer_checkout_prompt.md`
8. `07_voucher_redeem_prompt.md`
9. `08_dashboard_reports_prompt.md`
10. `09_tests_swagger_prompt.md`
11. `10_code_review_prompt.md`

## agent_files/copy_to_repo
Files designed to be copied into the actual repository for AI tools.

- `AGENTS.md` — root agent instruction file for Codex/OpenCode/Copilot agents.
- `CLAUDE.md` — Claude-oriented instructions.
- `GEMINI.md` — Gemini-oriented instructions.
- `ANTIGRAVITY.md` — Antigravity/Gemini/Claude workflow instructions.
- `.cursor/rules/*.mdc` — Cursor project rules.
- `.github/copilot-instructions.md` — GitHub Copilot repository instructions.
- `.github/instructions/voucher-project.instructions.md` — VS Code/Copilot reusable instruction file.
- `opencode.json` — OpenCode project config referencing shared instructions.
- `.codex/skills/*/SKILL.md` — Agent skills for specific implementation domains.

## Recommended implementation order
1. Database schema + seed data.
2. Auth + RBAC.
3. Partner profile/branch + voucher creation/submission.
4. Admin approval.
5. Customer catalog/cart/checkout.
6. Voucher code issuance + QR.
7. Partner redeem/check/confirm.
8. Dashboard/reporting/audit logs.
9. API docs + tests.
10. Deploy + final demo script.
