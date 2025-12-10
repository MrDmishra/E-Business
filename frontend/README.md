# E Business — Frontend (static React)

This frontend is provided as a single static `index.html` that uses CDN-hosted React and Babel for in-browser JSX transformation (development only). There is no Vite or build step by default.

Quick start options:

1) Development (quick, no build):

- Ensure backend is running on `http://localhost:8080` so `/api/products` is reachable.
- Open `frontend/index.html` in your browser (double-click) — the page will call the backend at `/api/products`.

2) Serve from the Spring Boot backend (recommended for integration):

- Copy `frontend/index.html` into `backend/src/main/resources/static/index.html` and start the Spring Boot app; the backend will serve the page at `http://localhost:8080/`.

Notes:
- Using Babel in the browser is only suitable for development/demo. For production, precompile assets and serve compiled bundles.
- If you want a no-build production-ready static bundle, I can precompile the app and add it into the backend's `static/` resources.
