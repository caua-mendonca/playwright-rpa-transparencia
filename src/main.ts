import { chromium } from 'playwright';
import { ServidoresRobot } from './robots/ServidoresRobot';
import { Logger } from './utils/Logger';
import { CONFIG } from './config/config';

async function main(): Promise<void> {
  const startTime = Date.now();

  Logger.section('RPA Servidores — Portal Transparência | Franca/SP');
  Logger.info(`Início da execução: ${new Date().toISOString()}`);
  Logger.info(`Modo: ${CONFIG.headless ? 'headless (sem interface)' : 'com interface gráfica'}`);
  Logger.info(`Timeout configurado: ${CONFIG.timeout / 1000}s por operação`);

  Logger.info('Inicializando browser Chromium...');
  const browser = await chromium.launch({ headless: CONFIG.headless });

  const context = await browser.newContext({
    ignoreHTTPSErrors: CONFIG.ignoreHTTPSErrors,
    acceptDownloads: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.timeout);
  Logger.info('Browser inicializado | locale: pt-BR | timezone: America/Sao_Paulo');

  try {
    const robot = new ServidoresRobot(context, page);
    const outputPath = await robot.run();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    Logger.section(`Execução concluída com sucesso | duração: ${duration}s`);
    Logger.info(`Arquivo final gerado: ${outputPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const screenshotPath = `${CONFIG.logsDir}/erro_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;

    Logger.section('Execução encerrada com erro');
    Logger.error(`Mensagem: ${message}`);
    Logger.error(`Screenshot de evidência salvo em: ${screenshotPath}`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    process.exit(1);
  } finally {
    await context.close();
    await browser.close();
    Logger.info('Browser encerrado e recursos liberados');
  }
}

main();
