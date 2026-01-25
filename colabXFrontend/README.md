# ColabX Frontend

ColabX is a centralized partnership and collaboration management platform designed for modern startups. This repository contains the frontend application built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern UI/UX**: Built with a sleek, dark-mode-first aesthetic using Tailwind CSS and custom UI components.
- **Authentication**: Secure Login and Signup pages with a custom 3D illustration layout (`/login`, `/signup`).
- **Responsive Design**: Fully responsive components including the Landing Page helper components.
- **Component Architecture**: Reusable UI components based on Radix UI primitives.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd colabXFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── footer/        # Footer components
│   ├── headers/       # Header components
│   ├── ui/            # Base UI elements (buttons, cards, etc.)
│   ├── login-form.tsx # Login form component
│   └── signup-form.tsx # Signup form component
├── pages/
│   └── public/        # Public pages (Landing, Auth)
├── lib/               # Utilities (cn, etc.)
└── App.tsx            # Main application component & Routing
```

## 🎨 Assets

- **Auth Illustration**: A custom 3D abstract illustration is used on the authentication pages (`/public/auth-illustration.png`).

