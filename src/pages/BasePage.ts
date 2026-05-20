import { Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { CONFIG } from '../config/config';
import { Logger } from '../utils/Logger';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected async takeScreenshot(name: string): Promise<void> {
    const screenshotDir = path.join(CONFIG.logsDir, 'screenshots');
    fs.mkdirSync(screenshotDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = path.join(screenshotDir, `${name}_${timestamp}.png`);

    await this.page.screenshot({ path: filepath, fullPage: true });
    Logger.info(`Screenshot salvo: ${filepath}`);
  }
}
