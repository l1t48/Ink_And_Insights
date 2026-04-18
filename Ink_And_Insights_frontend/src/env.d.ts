declare interface ImportMetaEnv {
  readonly VITE_apiBaseUrlLocal: string;
  readonly VITE_BaseUrlLocalWitoutAPI: string;
  readonly VITE_apiBaseUrlProduction: string;
  readonly VITE_apiBaseUrlProduction: string;
  readonly VITE_BaseUrlProductionWitoutAPI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}