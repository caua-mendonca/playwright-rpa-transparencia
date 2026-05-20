import { Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { BasePage } from './BasePage';
import { CONFIG } from '../config/config';
import { Logger } from '../utils/Logger';

export class ServidoresPage extends BasePage {
  private readonly selectors = {
    dropdownAnoLabel: '[id="formFiltro:cbmAno:cmbInput_label"]',
    dropdownMesLabel: '[id="formFiltro:cmbMes:cmbInput_label"]',
    tabelaResultados: 'table tbody tr',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async fillYear(year: string): Promise<void> {
    Logger.info(`Abrindo dropdown de Ano...`);
    await this.page.click(this.selectors.dropdownAnoLabel);
    await this.page.getByRole('option', { name: year }).click();
    Logger.info(`Ano selecionado: ${year} | aguardando AJAX do dropdown de Mês...`);
    await this.waitForNetworkIdle();
    Logger.info('Dropdown de Mês habilitado');
  }

  async fillMonth(monthLabel: string): Promise<void> {
    Logger.info(`Abrindo dropdown de Mês...`);
    await this.page.click(this.selectors.dropdownMesLabel);
    await this.page.getByRole('option', { name: monthLabel }).click();
    Logger.info(`Mês selecionado: ${monthLabel}`);
  }

  async clickPesquisar(): Promise<void> {
    Logger.info('Acionando botão "Pesquisar" | aguardando resposta AJAX...');
    await this.page.getByRole('button', { name: 'Pesquisar' }).click();
    await this.waitForNetworkIdle();
    Logger.info('Resposta recebida — tabela de resultados disponível');
  }

  async waitForResults(): Promise<void> {
    Logger.info('Validando carregamento da tabela de resultados...');
    await this.page.waitForSelector(this.selectors.tabelaResultados, { timeout: CONFIG.timeout });
    const rowCount = await this.page.locator(this.selectors.tabelaResultados).count();
    Logger.info(`Tabela validada | ${rowCount.toLocaleString('pt-BR')} registros de servidores encontrados`);
  }

  async downloadCsv(year: string, month: string): Promise<string> {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    const outputPath = path.resolve(CONFIG.outputDir, `servidores_${year}_${month}.csv`);

    Logger.info('Acionando link "Exportar para csv"...');
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('link', { name: 'Exportar para csv' }).click(),
    ]);

    Logger.info(`Download iniciado | nome sugerido pelo servidor: ${download.suggestedFilename()}`);
    await download.saveAs(outputPath);
    Logger.info(`Download concluído | arquivo salvo em: ${outputPath}`);

    return outputPath;
  }
}
