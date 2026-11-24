declare namespace NodeJS {
  interface ProcessEnv {
    /** Base URL of the FastAPI backend, e.g. `http://localhost:8000` */
    NEXT_PUBLIC_API_URL?: string;
    /** Name shown in the footer copyright line */
    NEXT_PUBLIC_NAME?: string;
    /** Client request timeout for API calls, in milliseconds */
    NEXT_PUBLIC_API_TIMEOUT_MS?: string;
  }
}
