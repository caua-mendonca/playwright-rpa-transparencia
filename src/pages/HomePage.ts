import { Page } from 'playwright';
import { BasePage } from './BasePage';
import { CONFIG } from '../config/config';
import { Logger } from '../utils/Logger';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    Logger.info(`Página carregada | título: "${await this.page.title()}"`);
  }

  async clickTransparencyPortal(): Promise<void> {
    Logger.info('Acionando link "Portal da Transparência"...');
    await this.page.getByRole('link', { name: 'Ícone de Portal da Transparê' }).click();
  }
}
