import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../config/config';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const SEPARATOR = '='.repeat(65);

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string): string {
  return `[${timestamp()}] [${level.padEnd(5)}] ${message}`;
}

function writeToFile(line: string): void {
  const logFile = path.join(CONFIG.logsDir, `rpa_${new Date().toISOString().slice(0, 10)}.log`);
  fs.mkdirSync(CONFIG.logsDir, { recursive: true });
  fs.appendFileSync(logFile, line + '\n', 'utf-8');
}

function write(level: LogLevel, message: string): void {
  const line = formatMessage(level, message);
  if (level === 'ERROR') console.error(line);
  else if (level === 'WARN') console.warn(line);
  else console.log(line);
  writeToFile(line);
}

export const Logger = {
  info(message: string): void {
    write('INFO', message);
  },

  warn(message: string): void {
    write('WARN', message);
  },

  error(message: string): void {
    write('ERROR', message);
  },

  section(title: string): void {
    const line = `[${timestamp()}] [-----] ${SEPARATOR}`;
    const titleLine = `[${timestamp()}] [-----]   ${title.toUpperCase()}`;
    console.log(line);
    console.log(titleLine);
    console.log(line);
    writeToFile(line);
    writeToFile(titleLine);
    writeToFile(line);
  },

  step(current: number, total: number, message: string): void {
    write('INFO', `[PASSO ${current}/${total}] ${message}`);
  },
};
