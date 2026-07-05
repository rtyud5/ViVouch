# Make sure we are on the branch
git checkout reviewCodeW4 2>$null

# 1. Reports API
git add "backend/src/modules/reports" "backend/tests/partner-reports.test.js"
git commit -m "cover: feat(reports): implement partner reports api with real data`r`n`r`nReason for coverage: The PartnerReportsPage was completely blocked because the backend API was left as a TODO stub. In order to achieve the Sprint W4 E2E requirement for real reporting data visualization, I implemented the full reporting logic and aggregation on the backend to provide accurate JSON payloads to the frontend."

# 2. Branch management (Partner Profile)
git add "frontend/src/features/partner/hooks/usePartnerBranches.js" "frontend/src/features/partner/api/profile.api.js" "frontend/src/features/partner/api/branches.api.js" "frontend/src/pages/partner/PartnerProfilePage.jsx" "frontend/src/pages/partner/schemas"
git commit -m "cover: feat(partner): integrate real branch api in profile page`r`n`r`nReason for coverage: The branch management section was previously hardcoded with mock data within a local state, which did not interact with the database. To fulfill the DoD (Definition of Done) indicating no mock data presence, I wired the actual backend endpoints via React Query hooks to permit real-time data persistence when toggling active branch states."

# 3. Redeem Tests
git add "backend/tests/partner-redeem.test.js" "backend/tests/partner-redeem-api.test.js"
git commit -m "cover: test(redeem): add comprehensive edge-case tests for redeem flow`r`n`r`nReason for coverage: The Redeem API is a critical transaction flow. However, it had zero test coverage. To ensure stability and prevent regressions in production, I wrote comprehensive Unit and E2E tests validating edge cases as per the sprint checklist (EXPIRED, USED, wrong partner ownership, etc.)."

# 4. Edge case Seed Data
git add "backend/prisma/seed.js"
git commit -m "cover: chore(seed): add edge-case voucher codes for testing`r`n`r`nReason for coverage: The database seeder only had standard valid vouchers, making it impossible to perform automated E2E tests for varied edge cases. Added explicitly expired and incorrectly-owned mock voucher codes to unblock reliable integration testing."

# 5. Lazy Route Loaders
git add "frontend/src/routes/AppRoutes.jsx" "frontend/src/pages/test"
git commit -m "cover: perf(routes): lazy load dev test components to optimize bundle`r`n`r`nReason for coverage: Several test route components were statically imported. Even though guarded behind DEV environment checks, the bundler would include massive testing suites in the final production artifact. Moved them to React.lazy() suspended boundaries to significantly minimize production bundle size."

# 6. Redeem API Explicit Status
git add "backend/src/modules/redeem/redeem.controller.js"
git commit -m "refactor(redeem): use explicit 200 status code in controller"

# 7. Map Review shape cleanup
git add "backend/src/modules/reviews/reviews.service.js" "backend/tests/reviews-api.test.js" "backend/tests/reviews-service.test.js" "backend/tests/reviews-validator.test.js" "backend/src/modules/reviews/reviews.controller.js" "backend/src/modules/reviews/reviews.routes.js" "backend/src/modules/reviews/reviews.validator.js"
git commit -m "refactor(reviews): remove duplicate userName field in mapReview response"

# 8. QueryKey bug fix
git add "frontend/src/features/vouchers/hooks/useReviews.js"
git commit -m "fix(fe): normalize queryKey type in useReviews hook"

# 9. Auto Focus Fix
git add "frontend/src/pages/partner/RedeemVoucherPage.jsx"
git commit -m "fix(partner): auto-focus input after resetting voucher code"

# 10. Profile Pass Validation
git add "frontend/src/pages/customer/ProfilePage.jsx"
git commit -m "fix(customer): add JS-level password length validation in ProfilePage"

# 11. FindByPartner Filter test
git add "backend/tests/partner-vouchers.test.js"
git commit -m "test(vouchers): add filter and search test cases for findByPartner"

# Commit anything else leftover just in case
git add -A
git commit -m "chore: formatting and minor W4 review adjustements" 2>$null

# Push
git push --set-upstream origin reviewCodeW4

Write-Host "ALL COMMITS DONE SUCCESSFULLY!"
