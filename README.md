# 🇮🇳 CivicAI

> **AI-powered civic assistance platform that helps citizens understand their rights, generate formal documents, and discover relevant government schemes — in English and Hindi.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://civic-ai-plum-three.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
[![AI](https://img.shields.io/badge/AI-Gemini-orange)](https://ai.google.dev/)
[![Language](https://img.shields.io/badge/Language-English%20%7C%20Hindi-blueviolet)]()

---

## 📌 Overview

**CivicAI** is an AI-powered civic assistance platform designed to make civic information easier to understand and act upon.

Many citizens face difficulties when dealing with everyday civic and legal problems because relevant information can be difficult to understand, scattered across different sources, or difficult to convert into actionable steps.

CivicAI provides a simple interface where users can:

- Describe a civic or legal problem in natural language.
- Understand their situation through AI-powered analysis.
- Generate formal documents such as complaints.
- Discover potentially relevant government schemes.
- Use the platform in **English or Hindi**.
- Access previous activities through a built-in history system.

The goal is to make civic assistance more **accessible, understandable, and actionable**.

---

# ✨ Features

## 🧭 Rights Navigator

Describe a civic or legal problem in your own words.

CivicAI analyzes the situation and provides structured information such as:

- Problem category
- Situation summary
- Possible rights
- Recommended actions
- Required documents
- Suggested next steps
- Relevant sources
- Disclaimer

### Example

**Input:**

> My landlord has not returned my security deposit after I moved out.

**Output:**

CivicAI analyzes the situation and provides possible actions and information that may help the citizen understand what they can do next.

---

## 📄 AI Draft Generator

CivicAI can generate formal documents based on a user's situation.

Users can provide:

- Document type
- Recipient
- Problem description
- Additional details

The generated document can then be:

- 📋 Copied
- ⬇️ Downloaded
- 🕘 Accessed through History

This helps users turn an informal problem description into a more structured formal document.

---

## 🏛️ Government Scheme Finder

Users can provide basic information such as:

- State
- Age
- Education
- Income
- Category
- Occupation

CivicAI then identifies potentially relevant government schemes from its available scheme data.

The feature also provides official source links so users can verify information independently.

---

## 🌐 Multilingual Support

CivicAI supports:

- 🇬🇧 English
- 🇮🇳 Hindi

Users can switch languages from the application interface.

The selected language is passed through the backend to the AI system so that generated explanations and documents can be returned in the selected language.

---

## 🕘 History

CivicAI keeps track of successful user activities.

History can include:

- Rights analyses
- Generated drafts
- Scheme searches

Users can revisit previous activities instead of starting from scratch.

Failed requests are not treated as successful activities.

---

## 🛡️ Reliability & Error Handling

CivicAI includes reliability mechanisms for AI-powered operations.

The backend handles temporary AI service failures such as:

- `503 Service Unavailable`
- `429 Rate Limit`

with retry handling.

The frontend also provides:

- Loading states
- Duplicate-request prevention
- Friendly error messages
- Retry capability
- Backend connection error handling

This helps make the application more reliable during demonstrations and real usage.

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      Vite           │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │      Express        │
                    └──────────┬──────────┘
                               │
                  ┌────────────┼─────────────┐
                  │            │             │
                  ▼            ▼             ▼
             ┌────────┐  ┌──────────┐  ┌─────────────┐
             │ Analyze│  │  Draft   │  │   Schemes   │
             └────┬───┘  └────┬─────┘  └──────┬──────┘
                  │           │               │
                  └───────────┼───────────────┘
                              ▼
                    ┌─────────────────────┐
                    │   Gemini AI API     │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │   History System    │
                    └─────────────────────┘
