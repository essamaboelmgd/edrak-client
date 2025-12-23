# Edrak Client (React + Vite)

This is the frontend application for the Edrak platform, built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## 🏗 Architecture: The "5-in-1" System

This single repository serves 5 different interfaces based on the **Subdomain** accessed:

| Subdomain       | Role                  | Description                                                             |
| --------------- | --------------------- | ----------------------------------------------------------------------- |
| `www` (or none) | **Platform Landing**  | The marketing site and teacher registration wizard.                     |
| `app`           | **Teacher Dashboard** | Where teachers manage their courses, students, and site settings.       |
| `student`       | **Student Dashboard** | Where students access their courses and materials.                      |
| `admin`         | **Super Admin**       | Platform administration panel.                                          |
| `*` (Any other) | **Teacher Site**      | The public website for a specific teacher (e.g., `mr-ahmed.edrak.com`). |

### Key Features

- **Dynamic Routing**: `useSubdomain` hook detects the current domain and renders the appropriate layout.
- **Role-Based Access Control (RBAC)**: `DashboardLayout` adapts its sidebar and header based on the user role.
- **Teacher Registration Wizard**: A multi-step form (4 Steps) for creating a full teacher academy in minutes.
- **Theme Engine**: Teachers can choose themes (Modern, Classic, etc.) and colors, which are applied dynamically.
- **Strict Typing**: Full TypeScript coverage for robust development.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM

### Installation

```bash
npm install
```

### Development

To run the local development server:

```bash
npm run dev
```

> **Note on Subdomains**: To test subdomains locally, you must configure your `/etc/hosts` file to point `app.localhost`, `admin.localhost`, etc., to `127.0.0.1`.

### Build

To build for production:

```bash
npm run build
```

## 📂 Project Structure

```
src/
├── api/             # Axios client and API services (Auth, etc.)
├── components/      # Shared UI components
│   ├── layout/      # DashboardLayout, Sidebar, Header
│   └── ui/          # Reusable atoms (Buttons, Inputs)
├── features/        # Feature-based modules
│   ├── on-boarding/ # Teacher Registration Wizard
│   └── themes/      # Theme components (Modern, Classic)
├── hooks/           # Custom hooks (useSubdomain)
├── pages/           # Page components
│   ├── app/         # Dashboard pages
│   ├── platform/    # Landing page
│   └── sites/       # Teacher websites
└── lib/             # Utilities (cn, validators)
```

## 🎨 Theme System

The `TeacherSite` component dynamically renders content based on the user's configuration. New themes should be added to `src/features/themes/` and registered in the mapped types.
