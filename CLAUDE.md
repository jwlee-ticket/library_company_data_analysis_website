# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Build Process
- `npm run build:icons` - Bundle Iconify icons (runs automatically on postinstall)

### Deployment
Vercel deployment process (from README):
1. Run `npm run build` to verify build works locally
2. Push changes to git
3. Run `npx vercel --prod` to deploy

## Architecture Overview

### Framework Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Material-UI (MUI) 6** for components
- **Tailwind CSS** with custom plugin
- **Iron Session** for authentication

### Project Structure

#### Core Architecture (`src/@core/`)
- Custom Material-UI theme system with color schemes and overrides
- Reusable component library (custom inputs, option menus, scroll-to-top)
- Settings context for theme/layout configuration
- Tailwind plugin integration

#### Layout System (`src/@layouts/` and `src/@menu/`)
- Multi-layout support: Vertical, Horizontal, Blank
- Context-driven navigation system with horizontal/vertical menu contexts
- Styled components for layout consistency
- Menu system with nested submenu support

#### Application Structure (`src/app/`)
- **Route Groups**: 
  - `(auth)`: Login/register pages
  - `(home)`: Main dashboard sections (concert, data, live, marketing, play, report, users)
  - Nested route groups for feature organization
- **API Routes**: Comprehensive REST API with routes for data management, live events, marketing, reports, users
- Session-based authentication middleware

#### Key Features
- **Data Analysis Dashboard**: Multiple dashboard types for concerts, plays, live events
- **File Upload System**: Data upload functionality with entry management
- **Marketing Calendar**: Marketing data management with calendar integration
- **Live Event Management**: Live event creation, detail management, and user assignment
- **Reporting System**: Various report types (daily, weekly, avg share, profit estimation)
- **User Management**: User CRUD operations with role-based access

#### Authentication & Security
- Middleware-based route protection (see `src/middleware.ts`)
- Session management with iron-session
- Public-only routes: `/login`, `/register`
- Protected routes redirect to `/login` when unauthenticated

#### Theme Configuration
- Template name: "LIBRARY" (see `src/configs/themeConfig.ts`)
- Dark mode default with customizable skin options
- Vertical layout with compact content width
- Settings stored in cookies with fallback to theme config

#### Navigation Structure
- Vertical menu data driven from `src/data/navigation/verticalMenuData.tsx`
- Iconify icons for consistent iconography
- Menu structure supports nested hierarchies

### Development Notes
- Uses App Router file-based routing
- Tailwind configured with logical properties plugin
- MUI integration with Next.js optimization
- TypeScript strict mode enabled
- Icon bundling system for Iconify icons