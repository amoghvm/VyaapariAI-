# VyapariAI — From Conversation to Business Action

**Team:** Wasted_Potential  
**Hackathon:** HackSprint Bangalore 2026  
**Track:** PS21 — FinTech & Commerce  
**Presenter:** Amogh V M

## 1. Overview

VyapariAI is a voice-first, AI-powered business assistant designed for small Indian merchants. It aims to simplify everyday business operations through natural-language conversations instead of requiring merchants to navigate multiple complicated forms and applications.

A merchant should be able to speak or type a request in a familiar language, allowing VyapariAI to interpret the request, prepare the relevant business action, present the details for review, and execute the action after confirmation.

Unlike a conventional digital ledger that primarily records transactions, VyapariAI aims to act as an intelligent business manager that helps merchants understand their business, make informed decisions, and simplify everyday operations.

**Our vision: Turn everyday business conversations into clear, verifiable business actions.**

## 2. Problem Statement

Small merchants often manage sales, purchases, inventory, customer credit, expenses, supplier dues, and business decisions using notebooks, spreadsheets, messaging apps, and disconnected digital tools.

These approaches create several challenges:

- Maintaining accurate and up-to-date business records.
- Tracking customer dues and supplier payments.
- Monitoring inventory and identifying products that need replenishment.
- Understanding revenue, expenses, margins, and business performance.
- Processing supplier invoices and purchase information efficiently.
- Making informed decisions without manually reviewing multiple records.
- Using conventional business applications that require navigating complicated screens.
- Accessing digital business tools comfortably when language is a barrier.

Many existing approaches digitize individual tasks but do not provide a unified, conversational way to understand business information and act on it.

VyapariAI aims to address these challenges by combining conversational AI, structured business records, business analytics, and workflow automation in one connected system.

## 3. Target Users

VyapariAI primarily targets small Indian merchants, including:

- Kirana and grocery store owners.
- Small retail shop owners.
- Merchants who maintain customer credit accounts.
- Businesses managing inventory and supplier purchases.
- Shop owners who want understandable business insights without complicated software.
- Businesses operating a single store or multiple branches.

The product is designed around the practical needs of merchants who want to spend less time maintaining records and more time running their businesses.

## 4. Product Principles

1. **Conversation first:** Enable merchants to express business tasks naturally through voice or text.
2. **Human approval:** Present important changes for review and confirmation before execution.
3. **Useful intelligence:** Ground answers and recommendations in the merchant's available business records.
4. **Action, not just answers:** Help transform a request into a practical next step or recorded transaction.
5. **Merchant control:** Keep the merchant in control of prices, records, approvals, and business decisions.
6. **Verifiable results:** Clearly communicate what was recorded or changed.
7. **Accessible design:** Make everyday business operations simple for busy shop owners.
8. **Data integrity:** Keep related business records consistent when transactions are completed.
9. **Extensible architecture:** Establish a foundation that can support additional business workflows over time.

## 5. Core Features

### 5.1 Voice and Text-Based Business Assistant

- Accept requests through voice or text.
- Support natural, conversational instructions.
- Aim to support Hindi and other Indian languages through appropriate language and speech technologies.
- Interpret requests and identify the intended business operation.
- Extract relevant information such as products, quantities, customers, amounts, dates, and payment methods.
- Present the extracted details for review and correction before confirmation.

Example requests:

- "Record three packets of biscuits sold for cash."
- "Show customers who still owe me money."
- "Which products are running low?"
- "How much did I spend this week?"

These examples describe intended interactions and do not imply that every workflow is already implemented.

### 5.2 Sales Management

- Record sales through conversational instructions.
- Identify products and quantities from the merchant's request.
- Capture applicable prices, payment details, and customer information.
- Present an editable transaction preview before confirmation.
- Maintain sales transaction records.
- Update inventory and relevant payment or credit records following a confirmed sale.

### 5.3 Purchase and Supplier Management

- Record purchases from suppliers.
- Capture purchased products, quantities, costs, and payment information.
- Maintain supplier information and purchase history.
- Track outstanding supplier dues and payments.
- Review purchase information before saving it.
- Keep purchase records connected to relevant inventory changes.

### 5.4 Inventory Intelligence

- Track stock changes associated with sales and purchases.
- Identify products with low stock.
- Provide reorder suggestions using available inventory information.
- Help merchants understand inventory movement.
- Reduce the risk of stock shortages and unnecessary overstocking.

### 5.5 Udhaar and Customer Credit Management

- Maintain customer credit records.
- Track outstanding customer dues.
- Record payments against amounts owed.
- Identify overdue balances.
- Support payment follow-ups and reminders.
- Help merchants understand their outstanding receivables.

### 5.6 Expense Management

- Record everyday business expenses through voice or text.
- Categorize expenses where sufficient information is available.
- Maintain expense history.
- Summarize spending over selected periods.
- Help merchants understand how expenses affect business performance.

### 5.7 Supplier Invoice and Bill Understanding

VyapariAI is intended to support the processing of supplier invoices and bills provided as supported images or documents, including PDFs and spreadsheets.

The planned workflow is:

1. Extract product names, quantities, prices, and totals.
2. Identify the supplier and match products against existing business records where possible.
3. Highlight uncertain matches, discrepancies, and potentially new products.
4. Present the extracted information in an editable purchase preview.
5. Allow the merchant to review and confirm the proposed operation.
6. Record the approved purchase and update the relevant inventory or supplier-payment records.

The merchant remains in control of whether the extracted information is accepted.

### 5.8 Business Analytics and Insights

Provide a business dashboard and conversational summaries covering information such as:

- Sales and revenue over time.
- Expenses and estimated profit, where sufficient data is available.
- Outstanding customer credit and supplier dues.
- Current inventory and low-stock products.
- Product-level sales performance.
- Purchasing patterns.
- Actionable observations based on recorded business information.

### 5.9 AI Business Copilot

The AI Business Copilot is intended to go beyond digital bookkeeping. It should help merchants understand their business, answer questions grounded in their records, and suggest practical next steps.

Example questions include:

- Which products are running low on stock?
- Which customers have outstanding dues?
- How much did my business sell today?
- What are my major expenses?
- Which products should I consider reordering?

The assistant should distinguish verified business information from estimates, assumptions, and recommendations.

### 5.10 Action Centre

The Action Centre is intended to turn business insights into practical actions.

Potential actions include:

- Reviewing low-stock alerts.
- Checking overdue customer payments.
- Examining invoice discrepancies.
- Considering reorder suggestions.
- Reviewing important business changes before approval.

Important changes should require merchant approval before execution, with the outcome verified afterward.

### 5.11 Multi-Store Business Management

- Support businesses operating one store or multiple branches.
- Organize records within the appropriate business and store context.
- Allow authorized users to work within their assigned permissions.
- Provide a foundation for store-level operations and consolidated business insights.

### 5.12 Adaptive Onboarding

The onboarding experience is intended to adapt to the merchant's business type and operational needs.

The aim is to collect the information required to configure the business while avoiding unnecessary questions and setup steps that are irrelevant to the merchant.

## 6. Intended User Experience

### Mobile-First Merchant Experience

The mobile application is envisioned as the primary interface for everyday business operations.

The intended experience is:

1. Speak or type a request.
2. Let VyapariAI interpret the instruction.
3. Review the extracted details.
4. Edit information if necessary.
5. Confirm the proposed action.
6. Receive a clear result.

### Desktop Business Dashboard

A complementary desktop experience is intended for tasks that benefit from a larger screen, including:

- Business analytics and summaries.
- Multi-store or branch oversight.
- Outstanding dues and inventory alerts.
- AI-generated insights.
- Operational and business performance reviews.

Both interfaces should operate as parts of one connected system, using consistent business records.

## 7. How VyapariAI Works

The proposed operating cycle is:

**Observe → Understand → Predict → Recommend → Approve → Act → Verify**

1. **Observe:** Receive a voice instruction, text message, or supported business document.
2. **Understand:** Interpret the request and extract the relevant details.
3. **Predict:** Analyze available business information to identify potential issues or opportunities.
4. **Recommend:** Suggest an appropriate action or prepare a proposed transaction.
5. **Approve:** Allow the merchant to review and confirm important changes.
6. **Act:** Execute the approved operation and update the relevant records.
7. **Verify:** Confirm the outcome and communicate the result to the merchant.

### Example Workflow: Recording a Sale

A merchant says, "Record three packets of biscuits sold for cash."

VyapariAI should aim to:

1. Identify the requested product and quantity.
2. Match the product against the merchant's records.
3. Retrieve the applicable selling price.
4. Calculate the proposed transaction total.
5. Display the transaction for review.
6. Record the sale after confirmation.
7. Update the relevant stock and payment records.
8. Confirm that the operation succeeded.

This illustrates the intended workflow, not a guarantee that every step is currently implemented.

## 8. Technology Stack and Architecture

The original planned technology direction includes:

- **Frontend:** React and Vite.
- **Programming language:** TypeScript.
- **Styling:** Tailwind CSS.
- **Backend and database services:** Supabase and PostgreSQL.
- **Authentication:** Supabase Auth.
- **Speech and Indian-language capabilities:** Sarvam APIs.
- **AI interpretation:** A language model for understanding requests and structuring business actions.
- **Workflow orchestration:** n8n was considered as an option for connecting AI interpretation with business workflows.

The intended architecture separates the user interface, business logic, structured data, and AI-powered interpretation. This helps the product evolve as additional workflows are introduced.

The final implementation may differ from this original plan. The technology list describes the intended direction and does not confirm that every integration is complete.

## 9. Trust, Security, and Data Integrity

VyapariAI is intended to follow these principles:

- Important business changes should require merchant confirmation.
- Extracted quantities, prices, totals, and transaction details should be validated.
- AI recommendations must not be presented as verified business facts.
- Business and store information must be protected using appropriate authentication and access controls.
- Related records should remain consistent when transactions are completed.
- Completed transactions should preserve the values used at the time of the transaction.
- Private API keys and credentials must remain on secure server-side paths.
- The application should clearly communicate whether an action succeeded or failed.

## 10. Running VyapariAI Locally

Follow these instructions to clone the repository, install dependencies, configure the application, and run it on your computer.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — preferably an LTS version.
- npm — included with Node.js.
- [Git](https://git-scm.com/).
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/).
- Access to the required Supabase project configuration.

### Step 1: Clone the GitHub Repository

Open PowerShell, Windows Terminal, or another terminal and run:

```bash
git clone https://github.com/amoghvm/VyaapariAI-.git
```

Navigate into the cloned project directory:

```bash
cd VyaapariAI-
```

To open the project in Visual Studio Code, run:

```bash
code .
```

If the `code` command is unavailable, open VS Code manually and select **File → Open Folder**, then choose the cloned `VyaapariAI-` directory.

If the repository is already cloned, navigate to its existing directory instead of cloning it again.

### Step 2: Install Dependencies

Ensure that the terminal is inside the project root directory, where `package.json` is located.

Run:

```bash
npm install
```

This installs the dependencies declared in `package.json`.

### Step 3: Configure Environment Variables

Create a file named `.env.local` in the project root, alongside `package.json`.

Add the following placeholders:

```env
VITE_SUPABASE_URL=https://tdlcdexteatdbkokcmcz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DJmGpZqJVqaKeeazJE6lWw_FRrvgyGp
```

Replace the placeholders with the correct values for your Supabase project.

You can obtain the project URL and publishable key, or legacy anon key, from the Supabase dashboard under **Connect** or **Project Settings → API Keys**.

**Important security precautions:**

- Never commit `.env.local` to GitHub.
- Never expose a Supabase `service_role` key, database password, or private AI API key in frontend code.
- Variables prefixed with `VITE_` are exposed to the browser and must contain only values intended to be public.
- Private AI API keys should be configured on a secure backend or Supabase Edge Function.
- Check the application's existing code and documentation for additional environment variables that may be required.

The variable names above reflect the expected configuration. If the application uses different names, follow the names referenced in its code.

### Step 4: Start the Development Server

Run:

```bash
npm run dev
```

Vite should display a local development URL in the terminal. It is typically:

```text
http://localhost:5173
```

Open the URL displayed by the terminal in your browser to access VyapariAI.

Keep the terminal running while using the application. Stop the development server with `Ctrl + C` when finished.

### Step 5: Verify the Application

After starting the application:

1. Open the local URL in your browser.
2. Test the sign-in and sign-up flows.
3. Check whether business and store setup works.
4. Verify that the relevant pages load correctly.
5. Test the available workflows using appropriate demo data.
6. Check the browser console for errors if something does not work.

Some functionality may require a correctly configured Supabase database, authentication policies, database functions, deployed Edge Functions, or AI provider credentials.

### Step 6: Run Project Checks

If the corresponding scripts exist in `package.json`, use these commands to validate the project.

**TypeScript checks:**

```bash
npm run typecheck
```

**Production build:**

```bash
npm run build
```

**Lint checks:**

```bash
npm run lint
```

A successful production build does not necessarily mean every feature or backend integration has been tested.

## 11. Troubleshooting

### Dependencies Fail to Install

- Confirm that Node.js and npm are installed.
- Check your internet connection.
- Review the error output before changing dependency versions.
- Confirm that you are running the command from the project root.

### Supabase Connection Errors

- Verify the project URL and public key.
- Confirm that the Supabase project is available.
- Check the browser console and network requests for additional details.
- Ensure that the configured environment variable names match those used by the application.
- Restart the development server after changing environment variables.

### Business or Store Setup Fails

- Check the browser console and failed network requests.
- Verify that the required database tables, policies, and database functions exist.
- Confirm that the signed-in user has the necessary permissions.
- Check backend or Supabase logs for errors.

### AI or Voice Features Do Not Work

- Verify that the relevant backend endpoint or Edge Function is deployed.
- Confirm that the required provider credentials are configured securely.
- Check server-side logs for provider errors.
- Verify that the configured AI model and API endpoint are supported.

### The Application Does Not Start

- Confirm that `npm install` completed successfully.
- Check the terminal for Vite or TypeScript errors.
- Verify that the required environment variables are configured.
- Check whether the local port is already in use.

**Setup note:** These are the expected setup steps for the project. The repository's current scripts, environment-variable requirements, and backend configuration should be checked if the application does not start as described.

## 12. Contributing

Contributions are welcome as the project develops.

1. Fork the repository or create a separate branch for your work.
2. Make changes within the relevant frontend or backend area.
3. Run the available type checks, lint checks, and production build.
4. Test the affected workflows.
5. Submit your changes through a pull request for review.

Please avoid committing environment files, API secrets, or unreviewed database changes.

## 13. Project Status

This README documents the original product vision, intended workflows, planned technology direction, and local development setup.

The listed capabilities describe the intended scope of VyapariAI. Individual features and integrations should be marked as implemented only after they have been developed and tested.

## 14. Vision

**VyapariAI — From Conversation to Business Action.**

Our vision is to make intelligent business management accessible to small merchants by transforming everyday conversations into useful insights and approved business actions.

We aim to help merchants spend less time maintaining records, make better-informed decisions, and focus more on growing their businesses.
