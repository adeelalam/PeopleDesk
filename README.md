# PeopleDesk — Employee Management (React)

A responsive employee directory built with React, TypeScript, Vite and Lucide icons.

## Features
- Dashboard statistics
- Search by name, email, job title or department
- Filter by department and employment status
- Add, edit and delete employees
- Form validation and duplicate-email checks
- Pagination
- Export filtered results to CSV
- Local browser persistence using `localStorage`
- Responsive layout

> This first version is frontend-only. The data is stored in the browser's localStorage, not in a backend or shared database. Do not use it for sensitive real employee data.

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

## Suggested next step: connect a backend
Replace the local state/localStorage persistence with an API client. Example endpoints:
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}`

The API should validate inputs, enforce authorization and persist data in a database. Frontend validation is for user experience only and is not a security boundary.
