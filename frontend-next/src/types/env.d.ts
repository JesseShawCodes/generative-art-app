declare namespace NodeJS {
  interface ProcessEnv {
    /** Base URL of the FastAPI backend, e.g. `http://localhost:8000` */
    readonly NEXT_PUBLIC_API_URL?: string;
    /** Name shown in the footer copyright line */
    readonly NEXT_PUBLIC_NAME?: string;
  }
}
