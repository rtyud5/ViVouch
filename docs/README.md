# ViVouch — Academic Documentation Index

This folder is the code-aligned project report for the voucher e-commerce platform. The implementation baseline is the modular-monolith architecture described in `AGENTS.md`; detailed source requirements remain in `agent-docs/`.

## Deliverables

| Area | Artifact | Traceability purpose |
|---|---|---|
| Requirements | [BRD summary](01_project_requirements/01_brd_summary.md) | Scope, goals, assumptions, limitations |
| Requirements | [Roles and permissions](01_project_requirements/02_roles_and_permissions.md) | RBAC matrix |
| Requirements | [Business rules](01_project_requirements/03_business_rules.md) | Voucher/order/code lifecycle |
| Requirements | [Acceptance criteria](01_project_requirements/04_acceptance_criteria.md) | Verifiable gate checklist |
| Analysis | [Use-case diagram](02_system_analysis/01_use_case_diagram.md) | Actor/system boundary |
| Analysis | [Use-case specifications](02_system_analysis/02_use_case_specs.md) | Preconditions, flows, errors |
| Analysis | [Activity diagrams](02_system_analysis/03_activity_diagrams.md) | Approval, checkout, redeem sequence |
| Database | [ERD](03_database_design/01_erd.md) | Entity relationships |
| Database | [Data dictionary](03_database_design/02_data_dictionary.md) | Table ownership and invariants |
| Architecture | [Overview](04_architecture_design/01_architecture_overview.md) | Components and dependencies |
| Architecture | [Design patterns](04_architecture_design/02_design_patterns.md) | Layering and consistency patterns |
| Architecture | [Transactions/locking](04_architecture_design/03_consistency_locking_cache.md) | Oversell/double-redeem prevention |
| Architecture | [Security](04_architecture_design/04_security.md) | Threat controls and limitations |
| API | [API overview](05_api_design/01_api_overview.md) | Route groups and response contract |
| API | [OpenAPI plan](05_api_design/02_api_docs_plan.md) | Documentation maintenance rules |
| Frontend | [UI routes](06_frontend_design/01_ui_routes.md) | Portal navigation and guards |
| Frontend | [UI components](06_frontend_design/02_ui_components.md) | Reusable component inventory |
| Testing | [Test plan](07_testing/01_test_plan.md) | Automated and manual coverage |
| Deployment | [Deployment plan](08_deployment/01_deployment_plan.md) | Environment, migration, rollback |
| Demonstration | [Demo script](09_demo/01_demo_script.md) | Ten-step defense flow |
| Presentation | [W5 release deck](10_presentation/ViVouch_W5_Release_Deck.pptx) | Acceptance, security, evidence, and release decision |
| W6-W7 extension | [Marketplace Demo+](11_w6_w7_marketplace/README.md) | OTP, Owner/Staff, wallet, payOS, refund, notifications, hardening and release runbook |

## Evidence policy

Every release claim must identify the candidate commit or patch manifest, command, result, and retained log. Zero-byte media, stale SHAs, owner signatures written by another person, and unverified external links are not accepted as evidence.

## Known assignment limitations

Real payment and email remain outside the basic assignment requirement, but the W6-W7 extension includes optional real SMTP delivery and a payOS hosted VietQR integration for demonstration. ViVouch Wallet, partner settlement, and payOS refund handling remain explicitly simulated or manual. The system is a student demonstration candidate, not a production financial platform.
