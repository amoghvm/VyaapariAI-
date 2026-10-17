
# VyapariAI — Kirana Product Catalogue & Inventory Management

## Overview

VyapariAI is an AI-powered business assistant designed to help Indian small merchants manage their daily business operations. The Kirana Product Catalogue feature provides a starting catalogue of commonly sold grocery and household products while allowing each shop owner to manage their own prices and inventory.

## Key Features

### 1. Product Catalogue
- Catalogue of 255 common kirana-store products.
- Products organized into categories such as grains, pulses, spices, snacks, beverages, personal care, and household cleaning.
- Product search, category filters, and product details.
- Support for product pack sizes and units.

### 2. Store-Specific Price Management
- Shop owners can set and update the selling price of each product.
- Purchase cost and selling price are maintained separately.
- Different stores can maintain different selling prices for the same catalogue item.
- Price changes apply to future sales and must not alter historical transactions.
- AI-generated price suggestions, if implemented, remain optional.

### 3. Inventory Management
- Track available stock for products.
- Record stock additions, reductions, and adjustments.
- Configure reorder thresholds and identify low-stock products.
- Update stock consistently when a sale is confirmed.

### 4. Sales and Billing
- Select products and quantities for a sale.
- Calculate totals using the applicable selling prices.
- Preserve the price charged for each completed sale.
- Reflect successful sales in inventory records.

### 5. Dashboard and Analytics
- View product and low-stock counts.
- Review sales totals and product-level performance.
- Estimate gross profit when purchase-cost data is available.

## Product Catalogue Data

The initial catalogue is supplied through JSON and CSV files.

- `vyapariai_kirana_catalogue.json` — structured product data for application integration.
- `vyapariai_kirana_catalogue.csv` — spreadsheet-friendly version for review.

The catalogue is intended as a starting template. Product prices and opening stock must be configured for the selected demo store rather than assumed to represent real market prices or actual inventory.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend and database:** Supabase
- **Authentication and access control:** Supabase Auth and Row Level Security (RLS)
- **Version control:** Git and GitHub

## Frontend Responsibilities

- Display products, categories, prices, and stock.
- Provide search, filters, and price-editing interfaces.
- Provide inventory adjustment and sales screens.
- Display loading states, validation errors, and success messages.
- Show analytics and low-stock warnings.

## Backend Responsibilities

- Store and retrieve product and category records.
- Enforce store-specific pricing and access permissions.
- Validate stock changes and sales transactions.
- Preserve historical sale prices.
- Prevent duplicate catalogue imports.
- Provide accurate data for analytics and inventory alerts.

## Security and Data Integrity

- Only authorized users may modify their store's prices and inventory.
- Database access policies must isolate data between businesses and stores.
- Catalogue imports must be validated and repeatable without creating duplicates.
- Inventory updates and sale confirmation must use validated backend operations.
- Secrets must never be exposed in frontend environment variables or committed to source control.

## Demo Workflow

1. Sign in and select the demo business and store.
2. Browse the kirana product catalogue.
3. Update a product's selling price.
4. Configure demo opening stock.
5. Record and confirm a sale.
6. Verify the transaction and stock update.
7. Review low-stock alerts and dashboard analytics.

## Development Status

The catalogue files provide the initial product data. Database compatibility, safe import, store-specific pricing, inventory operations, and end-to-end functionality must be verified against the current implementation before the feature is considered complete.

**Note:** Demo prices and inventory quantities should be clearly identified as simulated data during presentations.
