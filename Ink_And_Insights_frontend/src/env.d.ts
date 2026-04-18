interface ImportMetaEnv {
  readonly NG_APP_API_BASE_URL: string;
  readonly NG_APP_BASE_URL: string;
  readonly NG_APP_ENV: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}