<div align="center">

```
  ██████╗ ███████╗███╗   ███╗██████╗ ██╗██████╗     ██╗     ██╗  ██╗
 ██╔════╝ ██╔════╝████╗ ████║██╔══██╗██║██╔══██╗    ██║     ██║ ██╔╝
 ██║  ███╗█████╗  ██║╚██╔████╔██║██████╔╝██║██║  ██║    ██║     █████╔╝
 ██║   ██║██╔══╝  ██║ ╚██╔╝██║██╔══██╗██║██║  ██║    ██║     ██╔═██╗
 ╚██████╔╝███████╗██║  ╚═╝ ██║██████╔╝███████╗    ███████╗██║  ██╗
  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═════╝ ╚═╝╚══════╝     ╚══════╝╚═╝  ╚═╝
```

# GemBid LK — AI-Powered Gem Auction Platform

**DISCOVER · FOREVER · BRILLIANCE**

*A real-time gem auction marketplace for the Sri Lankan gem trade, combining premium 3D presentation, live bidding, certification transparency, and AI price prediction.*

---

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.1156-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)

---

## Overview

GemBid LK is a full-stack auction platform for fine gem trading. It brings together:

- **Live auctions** with bid history and auto-updates
- **AI-powered gem pricing** with SHAP explainability
- **Certification verification** for GIA/GRS/IGI-style gem reports
- **3D immersive frontend** built with Three.js and Vite
- **Backend APIs** powered by Express and Supabase
- **ML service** served by FastAPI and Uvicorn

This repository contains the frontend, backend, and machine learning microservice for the project.

---

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173`.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs by default on `http://localhost:3000`.

### 3. ML Service

```bash
cd ml
python3 -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The ML API runs at `http://localhost:8000`.

> If you use Windows, replace `python3` with `python` and activate the virtual environment before installing requirements.

---

## Features

- **Real-time auction system** with live bid updates and buy now support
- **AI prediction engine** for gem price estimation
- **SHAP explainability** to show why each prediction was made
- **Certification workflow** for gem documents and verification status
- **Watchlists and folders** for saved auctions
- **User roles and RBAC** for buyers, sellers, and admins
- **Responsive modern UI** with cinematic scroll interactions and 3D visuals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| 3D / UX | Three.js, React Three Fiber, Framer Motion, Lenis |
| Backend | Node.js, Express 5, Supabase |
| ML Service | Python, FastAPI, Uvicorn, scikit-learn / XGBoost, SHAP |
| Database | PostgreSQL via Supabase |
| Queue / Jobs | BullMQ, Redis |

---

## Project Structure

```text
ai-gem-auction-platform/
├── backend/                # Node.js + Express API
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── modules/
│       ├── middleware/
│       └── config/
├── frontend/               # React + Vite SPA
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── features/
│       ├── shared/
│       └── api/
└── ml/                     # Python ML microservice
    ├── requirements.txt
    └── app/
        ├── main.py
        ├── model.py
        └── schema.py
```

---

## ML Service

The ML microservice is a FastAPI app that loads a trained gem pricing model and exposes prediction endpoints.

Start it with:

```bash
cd ml
uvicorn app.main:app --reload --port 8000
```

If the ML model is not yet trained, run any available training script in `ml/` before starting the service.

---

## Notes

- Add the required environment variables for `frontend/` and `backend/` before running.
- Ensure Supabase auth and database keys are configured for backend access.
- Place the 3D gem model in `frontend/public/models/` if needed by the landing page.

---

## License

This project is licensed under the terms of the [LICENSE](./LICENSE) file.

<div align="center">
  <sub>GemBid LK · AI Auction Platform · Built for modern gem marketplaces</sub>
</div>
