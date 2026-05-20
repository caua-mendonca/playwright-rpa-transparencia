import { Page } from 'playwright';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class TransparencyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickServidores(): Promise<void> {
    Logger.info('Selecionando módulo "Servidores" no menu lateral...');
    await this.page.getByRole('link', { name: 'Servidores' }).click();
    await this.waitForNetworkIdle();
    Logger.info('Módulo Servidores selecionado com sucesso');
  }
}
