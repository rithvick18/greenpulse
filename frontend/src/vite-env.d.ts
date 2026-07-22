/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional base URL for the Django API. Defaults to "" (empty), meaning API
   * calls use relative paths like "/api/..." which are proxied to the backend
   * by vite.config.ts in dev (or by a reverse proxy in production). Set this
   * only when the frontend talks to the backend on a different origin.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
