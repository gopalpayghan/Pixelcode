<div align="center">

  <h1>⚡ Pixelcode</h1>
  <p><strong>A sleek, real-time collaborative code editor and multi-language execution platform for developers.</strong></p>

  <p>
    <a href="https://github.com/gopalpayghan/Pixelcode/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
    </a>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js 15" />
    </a>
    <a href="https://www.typescriptlang.org">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://convex.dev">
      <img src="https://img.shields.io/badge/Convex-Cloud%20DB-FF5722?logo=convex" alt="Convex" />
    </a>
    <a href="https://liveblocks.io">
      <img src="https://img.shields.io/badge/Liveblocks-Yjs%20Sync-000000?logo=liveblocks" alt="Liveblocks" />
    </a>
    <a href="https://vercel.com">
      <img src="https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel" alt="Vercel" />
    </a>
  </p>

  <p>
    <a href="https://pixelcode.vercel.app"><strong>🚀 Live Demo</strong></a> •
    <a href="https://github.com/gopalpayghan/Pixelcode/issues/new?template=bug_report.md">🐛 Report Bug</a> •
    <a href="https://github.com/gopalpayghan/Pixelcode/issues/new?template=feature_request.md">✨ Request Feature</a>
  </p>

</div>

---

## 📖 Overview

**Pixelcode** is a modern, high-performance online IDE and pair-programming platform built for developers, educators, and technical interviewers. It provides instant code execution across **10 popular programming languages** alongside real-time multi-user collaborative editing, live cursors, participant awareness, and custom sprint challenge timers.

Designed with an inspired interpretation of Vercel’s design system, Pixelcode delivers a dark-mode first, glassmorphic workspace featuring zero-latency document synchronization, clean state persistence, and automatic room lifecycle management.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router, React 19, TypeScript) |
| **Styling & Aesthetics** | Tailwind CSS, Custom Vercel Design System, Lucide Icons, Framer Motion |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`), `y-monaco` |
| **Real-Time Collaboration** | Liveblocks, Yjs (CRDT Document Synchronization) |
| **Backend & Database** | Convex (Serverless Realtime Database & Mutations) |
| **Code Execution Engine** | Piston API (Multi-language sandbox environment) |
| **Deployment** | Vercel (Frontend & Serverless API Routes), Convex Cloud (Production DB) |

---

## ✨ Key Features

- 👥 **Real-Time Collaborative Rooms**: Pair program seamlessly with live multi-user Yjs text synchronization, remote cursor decorations, user awareness, and kick controls.
- ⚡ **Multi-Language Execution**: Write and execute code instantly in **10 languages** (*JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, Ruby, Swift*) powered by the Piston engine.
- ⏱️ **Isolated Challenge Timers**: Independent practice sprint timers (15m, 30m, 45m, 60m) for Solo and Collaborative modes that persist across page reloads.
- 💾 **Automatic Local Storage Fallback**: Keystroke autosaving and state restoration guarantee zero code loss and zero line duplication on browser refreshes.
- 📚 **Snippets Library & Publishing**: Save private code snippets or publish public snippets to the developer community.
- 🛡️ **Room Navigation Interceptor**: Smart navigation guards prevent accidental room abandonment, prompting admins with simplified room deletion confirm modals.
- 🎨 **Vercel Design System Aesthetics**: Stark black-and-ink duet, 5-tier stacked shadow elevations, multi-color mesh background gradients, and Geist typography.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or **pnpm** / **yarn**)
- A free **Convex** account ([convex.dev](https://convex.dev))
- A free **Liveblocks** account ([liveblocks.io](https://liveblocks.io))

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/gopalpayghan/Pixelcode.git
   cd Pixelcode
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory (refer to the [Environment Variables](#-environment-variables) section below):
   ```bash
   cp .env.local.example .env.local
   ```

4. **Initialize Convex Backend**
   ```bash
   npx convex dev
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Environment Variables

Create a `.env.local` file in the root of your project and populate it with your environment keys:

```env
# Convex Database (Dev)
CONVEX_DEPLOYMENT=dev:your-dev-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Optional Socket.io Toggle (Set to false when using Liveblocks)
NEXT_PUBLIC_ENABLE_SOCKETIO=false

# Liveblocks Real-Time Public Key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_liveblocks_public_key
```

For **Production Deployment**, replace `NEXT_PUBLIC_CONVEX_URL` with your production Convex URL (`npx convex deploy`) and use your production Liveblocks key (`pk_prod_...`).

---

## 📦 Deployment

### Deploying to Vercel

1. **Push your code** to your GitHub repository.
2. Go to **[Vercel Dashboard](https://vercel.com)** and click **Add New Project**.
3. Import your `Pixelcode` repository.
4. Add the following **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_CONVEX_URL` = `https://clever-falcon-978.convex.cloud`
   - `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` = `pk_prod_your_production_key`
5. Click **Deploy**. Vercel will automatically build and publish your Next.js application.

---

## 🤝 Contributing & License

Contributions are always welcome! If you'd like to improve Pixelcode, please fork the repository, create a feature branch, and submit a pull request.

### License

This project is open-source and licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <sub>Built with ❤️ by Gopal Payghan</sub>
</div>