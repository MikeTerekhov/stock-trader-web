# Stock Portfolio Tracker

A full-stack stock portfolio tracker: search tickers, view charts/news/analyst recommendations, maintain a watchlist, and simulate buying/selling shares against a virtual cash balance.

- **Frontend**: Angular 17 (`angular-app/`) — search, portfolio, and watchlist views.
- **Backend**: Express (`index.js`) — proxies market data from [Polygon.io](https://polygon.io) and [Finnhub](https://finnhub.io), and persists balance/holdings/favorites in MongoDB Atlas.
- In production the Express server also serves the built Angular app, so both run as a single deployable service.

## Local development

1. Copy `.env.example` to `.env` and fill in `POLYGON_API_KEY`, `FINNHUB_API_KEY`, and `MONGODB_URI`.
2. Install dependencies: `npm install` at the repo root, and `npm install` inside `angular-app/`.
3. Start the API: `npm start` (serves on `http://localhost:8080`).
4. In another terminal, start the frontend: `npm start --prefix angular-app` (serves on `http://localhost:4200` and proxies API calls to `:8080` via `angular-app/proxy.conf.json`).

## Deploying (Render)

This repo includes a `render.yaml` Blueprint that builds the Angular app and runs the Express server as one web service.

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint** and connect the repo (Render will read `render.yaml`).
3. Set the environment variables (`POLYGON_API_KEY`, `FINNHUB_API_KEY`, `MONGODB_URI`, `CORS_ORIGIN`) in the Render dashboard when prompted.
4. In MongoDB Atlas, make sure Network Access allows connections from anywhere (0.0.0.0/0), since Render's free-tier egress IPs are dynamic.
