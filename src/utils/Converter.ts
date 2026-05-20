import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from './Logger';

export function convertCsvToXlsx(csvPath: string): string {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'convert_to_xlsx.py');
  const xlsxPath = csvPath.replace('.csv', '.xlsx');

  const csvSize = (fs.statSync(csvPath).size / 1024).toFixed(1);
  Logger.info(`Arquivo CSV: ${csvPath} | tamanho: ${csvSize} KB`);
  Logger.info(`Executando script de conversão: ${scriptPath}`);

  execSync(`python "${scriptPath}" "${csvPath}"`, { stdio: 'inherit' });

  const xlsxSize = (fs.statSync(xlsxPath).size / 1024).toFixed(1);
  Logger.info(`Conversão concluída | XLSX: ${xlsxPath} | tamanho: ${xlsxSize} KB`);

  return xlsxPath;
}
