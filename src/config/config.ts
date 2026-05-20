export const CONFIG = {
  baseUrl: 'https://www3.franca.sp.gov.br/',
  transparencyUrl: 'https://webpmf.franca.sp.gov.br/portal-transparencia/',
  servidoresUrl: 'https://webpmf.franca.sp.gov.br/portal-transparencia/paginas/publica/servidores.xhtml',
  outputDir: 'output',
  logsDir: 'src/logs',
  timeout: 30_000,
  ignoreHTTPSErrors: true,
  headless: false,
} as const;
