VyapariAI --- From Conversation to Business Action
Team: Wasted_Potential
Hackathon track: PS21 --- FinTech & Commerce
1. Overview
VyapariAI is a voice-first, AI-powered business assistant designed for
small Indian merchants. It helps shop owners manage everyday business
operations through natural-language conversations instead of requiring
them to navigate multiple complicated forms and screens.
A merchant should be able to speak or type a request in familiar
language and have VyapariAI interpret it, prepare the relevant business
action, show the details for review, and execute it only after
confirmation.
Product vision: Turn everyday business conversations into clear,
verifiable business actions.
2. Problem Statement
Small merchants often manage sales, purchases, inventory, customer
credit, expenses, supplier dues, and business decisions using a mixture
of paper records, memory, messaging apps, and disconnected digital
tools.
This makes it difficult to: - Keep business records accurate and up to
date. - Know which customers owe money and which payments are due. -
Track stock levels and identify products that need replenishment. -
Understand revenue, expenses, margins, and business performance. -
Process supplier invoices and purchase information efficiently. - Get
useful answers from business records without manually reviewing them.
Many tools digitize individual tasks, but merchants still need to move
between screens and interpret the information themselves. VyapariAI aims
to provide a more conversational, unified experience.
3. Target Users
- Kirana-store owners and other small retailers.
- Merchants who prefer speaking or typing in familiar Indian
  languages.
- Owners who need a simple way to record daily transactions and
  understand their business.
- Businesses operating one store or multiple branches.
The primary focus is small Indian merchants, with workflows designed
around practical daily operations.
4. Product Principles
1. Conversation first: Let merchants express tasks in natural
   language using voice or text.
2. Human approval: Show a clear preview of important actions and
   ask for confirmation before changing business records.
3. Useful intelligence: Answer questions using the merchant's
   actual business data rather than providing unsupported guesses.
4. Action, not just answers: Help turn a request into a recorded
   transaction or a practical next step.
5. Merchant control: Keep the merchant in control of prices,
   records, approvals, and business decisions.
6. Verifiable results: Show what was recorded or changed after an
   action completes.
7. Accessible design: Keep common tasks simple for busy shop owners
   and support mobile-first use.
5. Core Features
5.1 Voice and Text Assistant
- Accept requests through voice or text.
- Support natural, conversational interaction, with Indian-language
  support planned through Sarvam.
- Interpret merchant requests and identify the intended operation.
- Extract relevant details such as products, quantities, customers,
  amounts, dates, and payment methods.
- Allow the merchant to review and correct extracted information
  before confirmation.
Example requests: - "Record 3 packets of biscuits sold for cash." -
"Show customers who still owe me money." - "Which products are running
low?" - "How much did I spend this week?"
These are examples of intended interactions, not claims that every
workflow is already implemented.
5.2 Sales Recording
- Record sales from conversational input.
- Match mentioned products to business records.
- Capture quantities, prices, payment details, and customer
  information when applicable.
- Present an editable transaction preview before confirmation.
- Keep a record of the completed sale.
5.3 Purchases and Supplier Records
- Record purchases from suppliers.
- Capture purchased products, quantities, costs, and payment
  information.
- Maintain supplier records and outstanding supplier dues.
- Support reviewing purchase information before it is saved.
5.4 Inventory Intelligence
- Track stock changes associated with sales and purchases.
- Identify low-stock products.
- Provide reorder suggestions based on available inventory
  information.
- Help merchants understand which products may need replenishment.
5.5 Udhaar and Customer Credit
- Track customer credit and outstanding dues.
- Record payments against amounts owed.
- Help identify overdue balances.
- Support payment follow-ups and reminders.
5.6 Expense Management
- Record business expenses through voice or text.
- Categorize expenses where enough information is available.
- Summarize spending over a selected period.
- Help the merchant understand how expenses affect business
  performance.
5.7 Supplier Invoice and Bill Understanding
The planned workflow allows a merchant to provide a supplier invoice or
bill as a photo, PDF, or spreadsheet. VyapariAI can then aim to:
1. Extract product names, quantities, prices, and totals.
2. Match extracted items to existing product and supplier records.
3. Highlight missing products or discrepancies for review.
4. Present a purchase preview.
5. Save the purchase and related inventory or supplier-payment records
   only after confirmation.
5.8 Business Analytics and Insights
Provide a business dashboard and conversational summaries covering
relevant information such as: - Sales and revenue over time. - Expenses
and estimated profit, where the necessary data exists. - Outstanding
customer credit and supplier dues. - Current stock and low-stock
products. - Product-level performance. - Actionable observations based
on the merchant's recorded data.
5.9 AI Business Copilot and Action Centre
VyapariAI is intended to go beyond a digital ledger. Its AI copilot
should help merchants understand their business, answer questions
grounded in their records, and suggest practical next steps.
The intended action cycle is:
Observe → Understand → Predict → Recommend → Approve → Act → Verify
Recommendations should remain distinguishable from confirmed actions.
The merchant should approve important changes before they are carried
out.
5.10 Multi-Store and Business Support
- Support a business with one store or multiple stores.
- Allow authorized users to work within the appropriate business and
  store context.
- Keep records and analytics associated with the correct business or
  branch.
- Support roles and permissions appropriate to the business structure.
5.11 Adaptive Onboarding
The planned onboarding flow should collect the information needed to
configure the merchant's business. Questions and setup steps should
adapt to the business type and the workflows that are relevant to it,
rather than forcing every merchant through an identical setup.
6. Intended User Experience
Mobile-first merchant workflow
The mobile experience is the primary interaction surface for daily
work: - Speak or type a request. - Review the information understood by
the AI. - Edit details if necessary. - Confirm the action. - Receive a
clear result.
Desktop business dashboard
A desktop-oriented dashboard is intended for tasks that benefit from a
larger view, including: - Business analytics and summaries. - Branch or
store comparisons. - Outstanding dues and stock alerts. - AI-generated
insights and operational overviews.
The product should work as one connected system, with consistent
business records across the conversational interface and dashboard.
7. Typical End-to-End Workflow
1. Input: The merchant speaks, types a request, or provides a bill.
2. Interpretation: AI identifies the intended task and extracts
   relevant details.
3. Matching: The system matches products, customers, suppliers, and
   stores against available records.
4. Preview: The merchant sees a structured, editable preview.
5. Approval: The merchant confirms or corrects the proposed action.
6. Execution: The system records the approved operation and updates
   related records as appropriate.
7. Verification: VyapariAI reports the result and makes the updated
   information available in the dashboard.
For example, recording a confirmed sale should connect the sales record
with relevant inventory and payment or credit information, according to
the transaction details.
8. Planned Technology Direction
The original planned stack and integrations include:
- Frontend: React and Vite.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Database and backend services: Supabase and PostgreSQL.
- Indian-language speech and language capabilities: Sarvam APIs.
- AI interpretation: An LLM-based layer for understanding requests
  and structuring business actions.
- Workflow orchestration: n8n was considered for connecting AI
  interpretation with business workflows.
The final implementation may evolve as the team validates feasibility
and the hackathon requirements. This section describes the planned
direction, not a claim that every listed integration is complete.
9. Trust, Safety, and Data Integrity
- Important business changes should require merchant confirmation.
- The application should validate extracted quantities, prices,
  totals, and transaction details.
- AI-generated suggestions must not be presented as verified business
  facts.
- Business and store data must be protected with appropriate access
  controls.
- Transaction operations should keep related records consistent.
- Completed sales should preserve the values used at the time of the
  transaction.
- API keys and secrets must remain on secure server-side paths and
  must not be exposed in frontend code.
- The application should clearly indicate whether an action succeeded
  or failed.
10. Hackathon Demonstration Goal
The product is designed to demonstrate how a small merchant can move
from conversation to a completed business action without manually
navigating a complex system.
A strong demonstration can show: 1. A merchant gives a voice or text
instruction. 2. VyapariAI extracts the intended transaction details. 3.
The merchant reviews and edits the preview. 4. The merchant confirms the
action. 5. The application records the operation and updates relevant
business data. 6. The dashboard or copilot reflects the result.
The emphasis is on one polished, end-to-end workflow supported by an
architecture that can be extended to additional merchant operations.
11. Project Status
This README describes the original product vision and planned feature
set. Individual features and integrations should be marked complete only
after they have been implemented and tested.
VyapariAI --- From Conversation to Business Action
Built for small merchants, with AI designed to help them spend less time
maintaining records and more time running their businesses.
