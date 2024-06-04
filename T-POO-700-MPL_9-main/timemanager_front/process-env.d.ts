declare global {
    namespace NodeJS {
      interface ProcessEnv {
        [key: string]: string | undefined;
        VITE_API_URL: string;
        // add more environment variables and their types here
      }
    }
  }