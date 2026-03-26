# Expense Tracker

## Current State
Full-stack expense tracker (Version 6) with bank management, expense logging, CSV export, and monthly budgets. The backend uses non-stable `Map` variables for `banks` and `expenses`, meaning all data is wiped on every canister upgrade/deployment. The frontend calls `addBank` via an anonymous actor (no login required).

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend: Declare `banks` and `expenses` storage as stable so data persists across upgrades/deployments
- Backend: Preserve all existing API signatures exactly (no frontend changes needed)

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with stable variables for banks and expenses storage
2. Ensure all existing query and update functions remain identical
