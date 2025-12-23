# Edrak Frontend - Teacher Registration & Theming

## Overview

The Edrak client has been enhanced with a robust **Teacher Registration Wizard** featuring a **Dynamic Theme System**. This allows teachers to customize their platform's look and feel with real-time preview functionality during the sign-up process.

## Key Features

### 1. Dynamic Theme System

- **Theme Components**: Located in `src/features/themes/components/`.
  - `ModernTheme`: A clean, minimal layout using the user's primary color for headers.
  - `ClassicTheme`: A traditional layout with serif fonts and structured navigation.
  - `CreativeTheme`: A vibrant, gradient-heavy layout for creative disciplines.
- **Theme Renderer**: `ThemeRenderer.tsx` dynamically loads and renders the selected theme component based on the `templateId` prop.
- **Live Preview**: The `Step4SiteConfig` component features a split-screen layout with a sticky mobile-mockup preview that updates instantly as the user modifies:
  - Platform Name
  - Primary & Secondary Colors
  - Theme Template

### 2. Registration Wizard Architecture

The registration flow is managed by `src/features/on-boarding/page.tsx` and split into logical steps:

1.  **Personal Info**: Basic user details.
2.  **Contact & Professional**: Email, phone, specialization.
3.  **Credentials**: Password setup.
4.  **Site Configuration**: Subdomain, theme, and color selection (Enhanced).

### 3. Validation & Schemas

- **Zod Schema**: `src/features/on-boarding/schema.ts` defines the validation rules.
- **Subdomain Validation**: Regex-based validation ensures subdomains are URL-safe (`^[a-z0-9-]+$`).
- **Color Validation**: Optional hexadecimal color strings with strict fallbacks in UI.

## File Structure

```
src/features/
├── on-boarding/
│   ├── components/
│   │   ├── Step1Personal.tsx
│   │   ├── Step2Credentials.tsx
│   │   ├── Step3Contact.tsx
│   │   ├── Step4SiteConfig.tsx  <-- Heavily Modified
│   ├── page.tsx
│   ├── schema.ts                <-- Updated
├── themes/                      <-- New Feature
│   ├── components/
│   │   ├── ModernTheme.tsx
│   │   ├── ClassicTheme.tsx
│   │   ├── CreativeTheme.tsx
│   ├── index.ts                 <-- Exports Renderer & Registry
│   ├── types.ts                 <-- Theme Interfaces
```

## How to Add a New Theme

1.  Create a new component in `src/features/themes/components/` (e.g., `DarkTheme.tsx`).
2.  Ensure it accepts `ThemeProps` (primaryColor, secondaryColor, platformName).
3.  Register the theme in `src/features/themes/index.ts` within `THEME_REGISTRY`.
4.  It will automatically appear in the `Step4SiteConfig` selection grid.

## Subdomain & Backend Integration

- The frontend collects `subdomain`, `primaryColor`, `secondaryColor`, and `templateId`.
- These are passed to the backend `/auth/signup/teacher` endpoint.
- The backend validates subdomain uniqueness before creation.

## Development

- **Run**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm test`
