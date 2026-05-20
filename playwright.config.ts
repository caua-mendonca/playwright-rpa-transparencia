import { defineConfig } from 'playwright/test';

export default defineConfig({
  timeout: 60_000,
  use: {
    headless: false,
    ignoreHTTPSErrors: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
});
