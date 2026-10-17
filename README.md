# VyapariAI — From Conversation to Business Action

**Team:** Wasted_Potential  
**Hackathon:** HackSprint Bangalore 2026  
**Track:** PS21 — FinTech & Commerce  
**Presenter:** Amogh V M

## 1. Overview

VyapariAI is a voice-first AI business assistant designed to help small Indian merchants manage and grow their businesses through simple conversations.

Instead of navigating complicated software or manually maintaining multiple records, merchants can interact with VyapariAI using natural language through text or voice. The system aims to understand their requests, interpret business information, recommend actions, and help execute approved operations.

VyapariAI's vision goes beyond digital bookkeeping. It aims to act as an intelligent business manager that helps merchants understand their business, make informed decisions, and simplify everyday operations.

## 2. Problem Statement

Small merchants frequently manage sales, purchases, inventory, customer credit, supplier payments, and expenses using notebooks, spreadsheets, or disconnected applications.

These approaches can create several challenges:

- Time-consuming manual recordkeeping.
- Difficulty tracking customer dues and supplier payments.
- Limited visibility into inventory levels and product demand.
- Difficulty understanding profitability, expenses, and business performance.
- Missed opportunities to reorder stock at the right time.
- Complicated digital tools that require merchants to navigate multiple screens.
- Language barriers that make conventional business software less accessible.

VyapariAI aims to address these challenges through a conversational, AI-powered interface that simplifies business management.

## 3. Our Solution

VyapariAI combines conversational AI, business data, and workflow automation to help merchants manage their daily operations.

A merchant should be able to describe a business activity naturally, such as recording a sale, noting a purchase, checking customer dues, or asking which products need restocking.

The system is designed to interpret the request, extract the relevant information, identify matching business records, present the proposed changes for review, and execute the operation after the merchant approves it.

The goal is to make business management as simple as having a conversation.

## 4. Core Features

### 4.1 Voice and Text-Based Business Assistant

- Interact with the application using voice or text.
- Support natural conversational instructions.
- Aim to support Hindi and other Indian languages.
- Convert spoken requests into structured business operations.
- Reduce dependence on manual data entry and complicated forms.

### 4.2 Sales Management

- Record sales through conversational instructions.
- Identify products, quantities, and applicable prices.
- Maintain sales transaction records.
- Update inventory after a confirmed sale.
- Provide access to historical sales information.

### 4.3 Purchase and Supplier Management

- Record purchases from suppliers.
- Maintain supplier information and purchase history.
- Track supplier-related dues and payments.
- Simplify the recording of incoming stock.
- Help merchants understand their purchasing activity.

### 4.4 Inventory Intelligence

- Track product quantities and stock levels.
- Identify products that are running low.
- Provide reorder suggestions based on available business information.
- Help merchants understand inventory movement.
- Reduce the risk of stock shortages and unnecessary overstocking.

### 4.5 Udhaar and Customer Credit Management

- Maintain customer credit records.
- Track outstanding customer dues.
- Record payments against outstanding balances.
- Identify overdue payments.
- Help merchants manage customer credit more efficiently.

### 4.6 Expense Management

- Record everyday business expenses.
- Categorize expenses for easier analysis.
- Maintain expense history.
- Help merchants understand where their money is being spent.
- Include expense information in business performance summaries.

### 4.7 Intelligent Bill and Invoice Understanding

- Accept supported bill or invoice images and documents.
- Extract relevant information, such as products, quantities, and amounts.
- Match extracted items with existing product and supplier records where possible.
- Flag uncertain matches, discrepancies, and potentially new products.
- Allow the merchant to review and confirm the extracted information before updating business records.

### 4.8 Business Analytics and Insights

- Present sales, purchases, expenses, inventory, and outstanding dues in an understandable format.
- Provide a business dashboard for reviewing performance.
- Identify useful trends and potential issues.
- Generate concise business summaries.
- Help merchants make decisions using their own business records.

### 4.9 AI Business Copilot

The AI Copilot is intended to answer business-related questions using the merchant's available records.

Example questions include:

- Which products are running low on stock?
- Which customers have outstanding dues?
- How much did my business sell today?
- What are my major expenses?
- Which products should I consider reordering?

The assistant should distinguish between verified business data and suggestions or estimates.

### 4.10 Action Centre

The Action Centre is designed to turn insights into practical business actions.

Potential actions include reviewing low-stock alerts, checking overdue payments, examining invoice discrepancies, and considering reorder suggestions.

Important changes should require merchant approval before execution, with the result verified afterward.

### 4.11 Multi-Store Business Management

- Support merchants who operate multiple stores.
- Keep business and store information appropriately organized.
- Allow authorized users to work within the relevant store context.
- Provide a foundation for store-level operations and consolidated business insights.

### 4.12 Adaptive Onboarding

The onboarding experience is intended to adapt to the merchant's business type and requirements.

This helps establish relevant business information and makes the application easier to use for merchants with different operating needs.

## 5. Target Users

VyapariAI primarily targets small Indian merchants, including:

- Kirana and grocery store owners.
- Small retail shop owners.
- Merchants who maintain customer credit accounts.
- Businesses that manage stock and supplier purchases.
- Shop owners who want useful business insights without complicated software.

The product is designed around the practical needs of merchants who want to spend less time maintaining records and more time running their businesses.

## 6. Product Experience

### Mobile Application

The mobile application is envisioned as the primary interface for everyday business activities.

It emphasizes conversational interaction, quick data entry, transaction review, inventory visibility, and easy access to business information.

### Desktop Dashboard

A complementary desktop experience is intended for more detailed business management, including analytics, multi-store oversight, outstanding dues, inventory alerts, and AI-generated insights.

Together, these interfaces aim to provide a convenient experience for both daily operations and business planning.

## 7. How VyapariAI Works

The proposed workflow follows a structured action cycle:

**Observe → Understand → Predict → Recommend → Approve → Act → Verify**

1. **Observe:** Receive a voice instruction, text message, or supported business document.
2. **Understand:** Interpret the request and identify relevant business information.
3. **Predict:** Analyze available records to identify potential issues or opportunities.
4. **Recommend:** Suggest a suitable action or prepare a proposed transaction.
5. **Approve:** Allow the merchant to review and confirm important changes.
6. **Act:** Execute the approved operation and update the appropriate records.
7. **Verify:** Confirm the outcome and communicate the result to the merchant.

This approach is intended to make AI-assisted business operations useful, transparent, and reliable.

## 8. Technology Direction

The initial technology direction for VyapariAI includes:

- **Frontend:** React, Vite, TypeScript, and Tailwind CSS.
- **Backend and database:** Supabase and PostgreSQL.
- **Authentication:** Supabase Auth.
- **Conversational AI:** A language model for interpreting requests and generating business insights.
- **Speech processing:** Sarvam APIs for Indian-language speech capabilities.
- **Workflow orchestration:** n8n as a potential option for connecting automated workflows.

The architecture is intended to support a responsive user experience, structured business records, secure access, and extensible AI-powered workflows.

These technologies describe the planned direction and should not be interpreted as confirmation that every integration or feature has been completed.

## 9. Design Principles

VyapariAI is guided by the following principles:

- **Conversation first:** Make business operations accessible through natural language.
- **Merchant in control:** Keep the merchant responsible for approving important actions.
- **Business-context aware:** Ground answers and recommendations in available business records.
- **Simple and accessible:** Reduce unnecessary complexity for small business owners.
- **Action oriented:** Turn useful insights into practical next steps.
- **Transparent:** Clearly communicate proposed changes, results, and uncertainty.
- **Extensible:** Build a foundation that can support additional business workflows over time.

## 10. Expected Impact

VyapariAI aims to help small merchants:

- Reduce time spent on repetitive bookkeeping.
- Improve visibility into sales, stock, expenses, and dues.
- Make more informed purchasing and inventory decisions.
- Manage customer credit and supplier payments more systematically.
- Access business insights through a conversational interface.
- Adopt digital business management with less complexity.

## 11. Hackathon Demonstration Goal

The intended demonstration is to show how a merchant can communicate a business requirement naturally, review the AI's interpretation, approve the proposed action, and see the resulting business records updated.

The larger vision is to demonstrate how conversational AI can move beyond answering questions and become a practical assistant for everyday business operations.

## 12. Vision

**VyapariAI — From Conversation to Business Action.**

Our vision is to make intelligent business management accessible to every small merchant by transforming everyday conversations into useful insights and approved business actions.

*Note: This README describes the original product vision and planned capabilities. Individual features and integrations may still be under development.*
