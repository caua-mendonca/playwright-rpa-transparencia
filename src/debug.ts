import { chromium } from 'playwright';
import { CONFIG } from './config/config';

async function debug(): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: CONFIG.ignoreHTTPSErrors,
    acceptDownloads: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.timeout);

  // Ponto 1: Homepage da Prefeitura
  // → use "Pick locator" no Inspector para capturar o link do Portal da Transparência
  await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
  await page.pause();

  // Ponto 2: Portal da Transparência
  // → navegue manualmente até o Portal e capture o locator do link "Servidores"
  await page.pause();

  // Ponto 3: Página de Servidores
  // → navegue até Servidores e confirme/ajuste os locators do formulário
  await page.pause();

  await browser.close();
}

debug();
