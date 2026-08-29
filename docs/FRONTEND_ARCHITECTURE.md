# Cartify Frontend Architecture

This document describes the high-level architecture and folder structure for the Cartify frontend application.

## 1. Overall Architecture
Cartify uses a **Feature-based + Layered Architecture**. The goal is to maximize modularity and predictability by separating the codebase into distinct layers (routing, shared UI, reusable utilities, configuration) and highly cohesive feature domains (products, cart, auth, etc.). 

This setup allows for a scalable structure that integrates cleanly with the existing production-ready Express backend, enforcing clean separation between frontend responsibilities like server state management, client state, UI presentation, and routing.

## 2. Folder Structure

```
src/
├── app/                  # Next.js App Router (pages, layouts, route groups)
├── components/           # Shared, globally reusable components (UI, Layout, Feedback)
├── config/               # Centralized configuration (Site, Navigation)
├── features/             # Feature domains (Auth, Products, Cart, Admin, etc.)
├── hooks/                # Shared application-level custom hooks
├── lib/                  # Shared utilities (API clients, formatting, validation)
├── providers/            # React context providers (Query, Theme, Auth)
├── store/                # Global client-state stores (Zustand)
├── types/                # Global TypeScript definitions
└── middleware.ts         # Next.js middleware
```

## 3. Responsibilities

### App Router Architecture (`src/app/`)
Route definitions only. 
We use route groups `(store)`, `(admin)`, and `(auth)` to define layout boundaries without affecting URL paths. 
- **`app/(store)`**: Customer-facing shop routes (products, categories, cart). Uses a shared Store Layout.
- **`app/(auth)`**: Authentication routes (login, register). Uses a shared Auth Layout.
- **`app/(admin)`**: Admin dashboard routes. Uses a protected Admin Layout.

### Feature Architecture (`src/features/`)
Each business domain has its own encapsulated module folder. A feature folder acts like a mini-application, keeping highly related logic together.
Example feature (`src/features/products/`):
- `/api`: Axios endpoints for this feature
- `/components`: Feature-specific UI components
- `/hooks`: Feature-specific logic & TanStack query hooks
- `/schemas`: Zod validation schemas
- `/types`: TypeScript definitions
- `/utils`: Helper functions isolated to this feature
- `index.ts`: Public API export (barrel file) for the feature

### Shared Components Architecture (`src/components/`)
Contains purely presentational or layout components that don't belong to any specific feature.
- **`ui/`**: Low-level generic building blocks (Button, Input, Dialog, etc.). No business logic.
- **`shared/`**: Reusable app-level components (Logo, SearchInput, PriceDisplay).
- **`layout/`**: Structural components (Navbar, Footer, Sidebar).
- **`feedback/`**: Visual states (Loaders, Error boundaries, Toast wrappers).

### API Data Flow and State Management
- **Central API Client**: `lib/api/` contains the configured Axios instance.
- **Server State**: Managed via TanStack Query. Queries and mutations are wrapped in feature-specific hooks (`features/*/hooks/`).
- **Client State**: Minimal usage. Shared client state is in `src/store/` (Zustand), while feature-specific state resides in the feature folder (e.g., `features/cart/store/`). 

### Server vs Client Components
Follow App Router best practices by defaulting to **Server Components**. 
Use `"use client"` only at the leaves of the component tree, when necessary for interactivity, browser APIs, or client-side hooks.

## 4. Coding Standards and Rules
- **Import Aliases**: Use `@/` which is mapped to `./src/` in `tsconfig.json`.
- **Admin vs Customer**: Never mix admin-specific business logic or UI directly inside customer components. Maintain strict separation.
- **Do Not Over-Engineer**: Avoid unnecessary abstractions, nested repositories, or duplicate validation layers. Trust the backend for authorization.
- **Secret Management**: Never expose backend keys or secrets in the client codebase. Ensure all public vars are prefixed with `NEXT_PUBLIC_`.
