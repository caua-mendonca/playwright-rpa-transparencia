import { BrowserContext, Page } from 'playwright';
import { HomePage } from '../pages/HomePage';
import { TransparencyPage } from '../pages/TransparencyPage';
import { ServidoresPage } from '../pages/ServidoresPage';
import { getPreviousMonthYear } from '../utils/DateHelper';
import { convertCsvToXlsx } from '../utils/Converter';
import { Logger } from '../utils/Logger';
import { CONFIG } from '../config/config';

const TOTAL_STEPS = 6;

export class ServidoresRobot {
  constructor(
    private readonly context: BrowserContext,
    private readonly page: Page,
  ) {}

  async run(): Promise<string> {
    const { year, monthNumber, monthLabel } = getPreviousMonthYear();

    Logger.info(`Competência alvo: ${monthLabel}/${year} (mês atual - 1)`);
    Logger.info(`URL de destino: ${CONFIG.servidoresUrl}`);

    const servidoresPage = await this.navigateToServidores();

    Logger.step(3, TOTAL_STEPS, 'Preenchendo formulário de pesquisa');
    await servidoresPage.fillYear(year);
    await servidoresPage.fillMonth(monthLabel);

    Logger.step(4, TOTAL_STEPS, 'Executando pesquisa e aguardando resultados');
    await servidoresPage.clickPesquisar();
    await servidoresPage.waitForResults();

    Logger.step(5, TOTAL_STEPS, 'Realizando download do relatório CSV');
    const csvPath = await servidoresPage.downloadCsv(year, monthNumber);

    Logger.step(6, TOTAL_STEPS, 'Convertendo CSV para XLSX via Pandas');
    return convertCsvToXlsx(csvPath);
  }

  private async navigateToServidores(): Promise<ServidoresPage> {
    const homePage = new HomePage(this.page);

    Logger.step(1, TOTAL_STEPS, `Acessando site da Prefeitura | ${CONFIG.baseUrl}`);
    await homePage.navigate();

    Logger.step(2, TOTAL_STEPS, 'Abrindo Portal da Transparência (nova aba)');
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      homePage.clickTransparencyPortal(),
    ]);
    await newPage.waitForLoadState('networkidle');
    Logger.info(`Nova aba carregada | URL: ${newPage.url()}`);

    const transparencyPage = new TransparencyPage(newPage);
    await transparencyPage.clickServidores();
    Logger.info(`Módulo Servidores carregado | URL: ${newPage.url()}`);

    return new ServidoresPage(newPage);
  }
}
