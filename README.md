# SportFlix Streaming Application

SportFlix is a premium, open-source Web IPTV player designed for streaming live television feeds. It features a dedicated **FIFA World Cup 2026 Hub** complete with a live tournament standings scoreboard, a language-categorized broadcast library, and presets to import popular global FAST channel playlists (Pluto TV, Samsung TV Plus, Roku, Plex).

---

## Key Features

1.  **FIFA World Cup 2026 Live Center**:
    *   Match schedules with real-time stream status.
    *   Language-specific broadcast library (English, Spanish, Portuguese, German, Chinese, Indonesian, Turkish, Thai) supporting multi-language feeds.
2.  **Live Tournament Scoreboard**:
    *   Group Standings (Groups A, B, C, and D) with positions, matches played, goal differences, and points.
    *   Visual highlights denoting advancing positions (top 2 spots).
3.  **FAST Playlists Importer Presets**:
    *   Preconfigured single-click presets in Settings to import hundreds of free channels from **Pluto TV**, **Samsung TV Plus**, **Roku**, **Plex**, and **IPTV-org**.
4.  **Backend CORS Stream Proxy**:
    *   Bypasses browser CORS blocks for HLS `.m3u8` streams on-the-fly.
    *   Rewrites relative chunk paths and sub-playlist URIs.
    *   Directly pipes media segment files (`.ts` chunks) to minimize server memory footprint.
5.  **Smart Player Fallback**:
    *   Automatically detects network errors and reroutes failing direct HLS streams through the backend CORS proxy without manual user intervention.
    *   Provides a clean "Go Back" error recovery button so users aren't stuck on a black screen.

---

## Technical Stack

*   **Frontend (Client)**: React, Vite, TailwindCSS (for styling), Lucide React (icons), React Router (navigation), TanStack React Query (data fetching), HLS.js (media engine).
*   **Backend (Server)**: Node.js, Express, TypeScript, Axios (HTTP client), Prisma & SQLite (database), `iptv-playlist-parser` (M3U parser).

---

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/SportFlix.git
    cd SportFlix
    ```

2.  **Install Dependencies**:
    Install dependencies in both the backend and client directories:
    ```bash
    # Install backend dependencies
    cd server
    npm install
    
    # Run Prisma database migrations
    npx prisma migrate dev --name init
    
    # Install client dependencies
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**:
    From the `server` directory, run:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000` and automatically run health checks on the seeded channel library.

2.  **Start the Frontend Client**:
    From the `client` directory, run:
    ```bash
    npm run dev
    ```
    The frontend dev server will start on `http://localhost:5173`. Open it in your browser.

---

## Deployment & Production Build

### Building for Production

To create optimized production bundles:

*   **Client**: Run `npm run build` inside the `client` folder. The output files will be in `client/dist`.
*   **Server**: Run `npm run build` inside the `server` folder. The compiled files will be in `server/dist`.

### Deployment Checklist

1.  **Configure environment variables**: Setup `DATABASE_URL` in your server `.env` pointing to your production database.
2.  **Expose ports**: Ensure your hosting provider allows traffic on ports `5000` (API) and `5173` (Frontend or configure standard port mapping like 80/443).
3.  **CORS Setup**: Set the `API_BASE_URL` in `client/src/services/api.ts` to your production backend URL.
