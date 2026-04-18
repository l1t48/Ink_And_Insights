# Book & Quotes Management Frontend

**Note:**
This project was previously deployed online. However, due to limitations of the free hosting plan, the database expired, and the deployment was subsequently taken down.

## Introduction
This is the frontend application for a book and quotes management system, built with Angular 20 and TypeScript. It provides a responsive and user-friendly interface for managing books and quotes, supporting authentication, CRUD 
operations, and dynamic content rendering.

## Tools & Libraries Used
- Angular 20 – Frontend framework for building the application.
- Font Awesome - Icons.
- Bootstrap – Responsive CSS framework for styling and layout.
- SignalR – Real-time updates for books and quotes.
- HTTP Interceptor – Handles authentication tokens and request/response processing globally in the app.

## Installation & Running

### Prerequisites
Before running the project, ensure the following are installed on your system:
- Node.js v20.19.0 – Required for Angular 20 to work correctly.
- npm (Node Package Manager) – Comes with Node.js.
- A modern browser for testing the frontend.

### Install Dependencies
Navigate to the project root and run: ``` npm install ```. This installs all required packages, including Angular 20, Bootstrap, and SignalR for real-time updates.

### Running Locally (Development)
To start a local development server: ``` ng serve ```. The application will be available at http://localhost:4200 by default.

### Building for Production
To create a production-ready build: ``` ng build ```. Compiles and optimizes the application into the dist/ folder.

## Project Structure

| Folder / File             | Description / Purpose                          |
| ------------------------- | ---------------------------------------------- |
| **src**                   | Source code                                    |
| **app**                   | Main Angular application code                  |
| app.routes.ts             | Application routes                             |
| app.ts                    | Main Angular module                            |
| **components**            | Reusable UI components                         |
| books-page                | Components for books page                      |
| add-book-modal.ts         | Modal component to add a new book              |
| edit-book-modal.ts        | Modal component to edit an existing book       |
| general                   | General-purpose components                     |
| header.ts                 | Header component with navigation               |
| theme-switcher.ts         | Dark/light theme toggle component              |
| quotes-page               | Components for quotes page                     |
| add-quote-modal.ts        | Modal component to add a new quote             |
| edit-quote-modal.ts       | Modal component to edit an existing quote      |
| **environment**           | Environment configurations                     |
| environment.prod.ts       | Production environment configuration           |
| environment.ts            | Development environment configuration          |
| **helper**                | Helper utilities                               |
| modal-helper.ts           | Helper functions for modal management          |
| **pages**                 | Application pages                              |
| auth-page.ts              | Login/register page                            |
| books-list-page.ts        | Page displaying a list of books                |
| quotes-list-page.ts       | Page displaying a list of quotes               |
| **services**              | Services and business logic                    |
| CredentialsInterceptor.ts | Interceptor for adding auth tokens to requests |
| api.service.ts            | API service for backend requests               |
| auth-state.service.ts     | Tracks user authentication state               |
| auth.guard.ts             | Route guard for protected routes               |
| signalr.service.ts        | Service for real-time updates using SignalR    |
| index.html                | Main HTML entry point                          |
| main.ts                   | Bootstrap file for Angular                     |
| angular.json              | Angular CLI configuration                      |
| package.json              | NPM dependencies and scripts                   |
| tsconfig.json             | TypeScript configuration                       |
| **public**                | Public assets                                  |
| literature.png            | Sample image asset                             |


## Environment Configuration
The frontend requires configuration to connect to the backend API and manage application settings.

| Variable                  | Description                                  | Example Value               |
| ------------------------- | -------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL_LOCAL` | Base URL for API requests (including `/api`) | `http://localhost:5069/api` |
| `VITE_BASE_URL_LOCAL`     | Base URL for the backend (without `/api`)    | `http://localhost:5069`     |


## Frontend Test Verification Checklist

The following table summarizes all frontend functionality tests conducted to ensure proper CRUD operations, authentication, responsive design, user experience, and API validation (All API text validation rules were tested in the frontend. Each invalid input returned the correct error response from the backend according to the test case):

| Feature/Category                         | What Was Tested                                        | Result / Confirmation                                |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Books CRUD - View List**               | Display all books on the main page                     | ✅ List displays correctly                            |
| **Books CRUD - Add**                     | Add a new book via form and return to main page        | ✅ Book added and list updates immediately            |
| **Books CRUD - Edit**                    | Edit an existing book via form and return to main page | ✅ Book updated and list updates immediately          |
| **Books CRUD - Delete**                  | Delete a book                                          | ✅ Book removed and list updates immediately          |
| **Token Handling - Registration**        | Register a new user                                    | ✅ Registration successful, JWT generated             |
| **Token Handling - Login**               | Log in with valid credentials                          | ✅ Login successful, JWT stored in frontend           |
| **Token Handling - Protected Endpoints** | Attempt to modify books without token                  | ✅ Blocked for unauthenticated users                  |
| **My Quotes - View Quotes**              | Display at least 5 quotes on a separate page           | ✅ Quotes displayed correctly                         |
| **My Quotes - CRUD**                     | Add, edit, delete quotes                               | ✅ All operations work and list updates immediately   |
| **Page Navigation**                      | Switch between Books and Quotes via menu               | ✅ Navigation works correctly                         |
| **Responsive Design**                    | Test on mobile, tablet, and desktop                    | ✅ Layout and navbar adapt correctly                  |
| **Bootstrap & Font Awesome**             | Check forms, buttons, icons                            | ✅ Bootstrap elements and icons display correctly     |
| **Extra Challenge - Light/Dark Mode**    | Toggle between light and dark theme                    | ✅ Light/Dark mode button works correctly             |
| **API Text Validation**                  | Invalid inputs tested against backend                  | ✅ Correct error messages returned for all test cases |

