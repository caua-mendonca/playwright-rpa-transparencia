# RPA Servidores — Portal Transparência Franca/SP

> Automação de extração e conversão de dados de remuneração de servidores públicos do município de Franca/SP, construída com **Playwright + TypeScript** seguindo arquitetura RPA profissional.

---

## Índice

- [Visão Geral](#visão-geral)
- [Fluxo RPA](#fluxo-rpa)
- [Demonstração do Fluxo](#demonstração-do-fluxo)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Padrões de Projeto](#padrões-de-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Output Gerado](#output-gerado)
- [Decisões Técnicas](#decisões-técnicas)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Licença](#licença)
- [Autor](#autor)

---

## Visão Geral

Este projeto é uma aplicação de **RPA (Robotic Process Automation)** que automatiza o acesso ao [Portal da Transparência da Prefeitura de Franca/SP](https://webpmf.franca.sp.gov.br/portal-transparencia/) para extrair mensalmente os dados de remuneração dos servidores públicos municipais.

O robô executa o seguinte fluxo de forma autônoma:

1. Acessa o site da Prefeitura de Franca/SP
2. Navega até o Portal da Transparência → Servidores
3. Preenche o formulário com **Ano atual** e **Mês anterior** automaticamente
4. Dispara a pesquisa e aguarda o retorno dos dados via AJAX
5. Realiza o download do relatório em formato CSV
6. Converte o CSV para **XLSX** utilizando Python + Pandas

O projeto foi desenvolvido com foco em **Clean Code**, **separação de responsabilidades** e **escalabilidade**, sendo facilmente adaptável para outros módulos do portal (licitações, despesas, receitas, etc.).

---

## Fluxo RPA

Tabela detalhada de cada etapa executada pelo robô, os componentes envolvidos e o comportamento esperado:

| Etapa | Ação | Componente | Detalhe Técnico |
|:---:|---|---|---|
| 1 | Inicializar browser | `main.ts` | Abre Chromium com `ignoreHTTPSErrors: true` e `acceptDownloads: true` |
| 2 | Calcular competência | `DateHelper` | Retorna ano atual e mês anterior capitalizado em pt-BR (ex.: `Abril/2026`) |
| 3 | Acessar Prefeitura | `HomePage` | Navega para `https://www3.franca.sp.gov.br/` e aguarda `domcontentloaded` |
| 4 | Navegar para Servidores | `ServidoresRobot` | Acessa diretamente a URL `servidores.xhtml` aguardando `networkidle` |
| 5 | Selecionar Ano | `ServidoresPage.fillYear()` | Clica no label do dropdown PrimeFaces → seleciona a opção pelo `role='option'` → aguarda AJAX |
| 6 | Selecionar Mês | `ServidoresPage.fillMonth()` | Mesmo padrão do Ano — o dropdown de Mês só habilita após AJAX do Ano completar |
| 7 | Pesquisar | `ServidoresPage.clickPesquisar()` | Clica no botão → aguarda `networkidle` (retorno da tabela via AJAX) |
| 8 | Validar resultados | `ServidoresPage.waitForResults()` | Aguarda `table tbody tr` aparecer e loga a quantidade de registros encontrados |
| 9 | Download CSV | `ServidoresPage.downloadCsv()` | Registra listener com `Promise.all` antes do clique → salva em `output/servidores_YYYY_MM.csv` |
| 10 | Converter para XLSX | `Converter` → `convert_to_xlsx.py` | Chama Python via `execSync` → pandas lê CSV (utf-8, sep=`,`) → gera `output/servidores_YYYY_MM.xlsx` |
| 11 | Encerrar browser | `main.ts` (finally) | Fecha `context` e `browser` independentemente de sucesso ou erro |
| 12 | Screenshot de erro | `main.ts` (catch) | Em caso de falha, salva print da tela em `src/logs/erro_TIMESTAMP.png` |

---

## Demonstração do Fluxo

```
npm start
    │
    └─▶ main.ts — inicializa o browser Chromium
          │
          └─▶ ServidoresRobot.run()
                │
                ├─▶ DateHelper.getPreviousMonthYear()
                │       └── retorna { year: '2026', monthLabel: 'Abril' }
                │
                ├─▶ HomePage.navigate()
                │       └── acessa https://www3.franca.sp.gov.br/
                │
                ├─▶ page.goto(servidoresUrl)
                │       └── navega para o formulário de servidores
                │
                ├─▶ ServidoresPage.fillYear('2026')
                │       └── clica no dropdown PrimeFaces → seleciona '2026'
                │           aguarda resposta AJAX (mês habilita após ano)
                │
                ├─▶ ServidoresPage.fillMonth('Abril')
                │       └── clica no dropdown PrimeFaces → seleciona 'Abril'
                │
                ├─▶ ServidoresPage.clickPesquisar()
                │       └── clica em "Pesquisar" → aguarda AJAX retornar tabela
                │
                ├─▶ ServidoresPage.waitForResults()
                │       └── valida que a tabela foi carregada (ex: 5.651 registros)
                │
                ├─▶ ServidoresPage.downloadCsv()
                │       └── registra listener de download → clica em "Exportar para csv"
                │           salva: output/servidores_2026_04.csv
                │
                └─▶ Converter.convertCsvToXlsx()
                        └── chama: python src/scripts/convert_to_xlsx.py
                            pandas.read_csv → df.to_excel
                            salva: output/servidores_2026_04.xlsx
```

---

## Tecnologias

| Tecnologia | Versão | Papel |
|---|---|---|
| [TypeScript](https://www.typescriptlang.org/) | ^5.4.0 | Linguagem principal — tipagem estática e DX |
| [Playwright](https://playwright.dev/) | ^1.44.0 | Automação do browser (Chromium) |
| [Node.js](https://nodejs.org/) | 18+ | Runtime TypeScript |
| [Python](https://www.python.org/) | 3.8+ | Conversão CSV → XLSX |
| [Pandas](https://pandas.pydata.org/) | ^2.0.0 | Leitura e transformação do CSV |
| [OpenPyXL](https://openpyxl.readthedocs.io/) | ^3.1.0 | Engine de escrita do arquivo XLSX |
| [ts-node](https://typestrong.org/ts-node/) | ^10.9.0 | Execução TypeScript sem compilação prévia |

---

## Arquitetura

O projeto segue uma arquitetura em camadas inspirada nos princípios de RPA corporativo:

```
┌─────────────────────────────────────────────────────────────┐
│                        ENTRY POINT                          │
│                         main.ts                             │
│         (lifecycle do browser, tratamento de erros)         │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                         ROBOT LAYER                         │
│                    ServidoresRobot.ts                       │
│         (orquestração da sequência de execução)             │
└──────┬──────────────────────────────────┬───────────────────┘
       │                                  │
┌──────▼──────────────────┐   ┌───────────▼───────────────────┐
│      PAGE LAYER (POM)   │   │         UTILS LAYER           │
│                         │   │                               │
│  BasePage.ts            │   │  DateHelper.ts                │
│  HomePage.ts            │   │  Logger.ts                    │
│  TransparencyPage.ts    │   │  Converter.ts                 │
│  ServidoresPage.ts      │   │                               │
└──────────────────────────┘   └───────────────────────────────┘
                                            │
                             ┌──────────────▼────────────────┐
                             │         SCRIPTS LAYER         │
                             │    convert_to_xlsx.py         │
                             │     (Python + Pandas)         │
                             └───────────────────────────────┘
```

### Camadas e responsabilidades

| Camada | Arquivo(s) | Responsabilidade |
|---|---|---|
| **Entry Point** | `main.ts` | Inicializa e encerra o browser; captura erros globais e tira screenshot de evidência |
| **Robot** | `ServidoresRobot.ts` | Orquestra a sequência de passos; não conhece seletores ou UI |
| **Pages (POM)** | `*Page.ts` | Encapsula seletores e ações de cada página do portal |
| **Utils** | `DateHelper`, `Logger`, `Converter` | Funções puras e utilitários reutilizáveis |
| **Config** | `config.ts` | Fonte única de verdade para URLs, timeouts e flags |
| **Scripts** | `convert_to_xlsx.py` | Conversão de formato com pandas |

---

## Padrões de Projeto

### Page Object Model (POM)

Cada página do site é representada por uma classe TypeScript. Os seletores ficam encapsulados dentro da própria page — se o portal mudar um seletor, o ajuste é feito em **um único lugar**.

```typescript
// ServidoresPage.ts
private readonly selectors = {
  dropdownAnoLabel: '[id="formFiltro:cbmAno:cmbInput_label"]',
  dropdownMesLabel: '[id="formFiltro:cmbMes:cmbInput_label"]',
  btnPesquisar:     'button:has-text("Pesquisar")',
  linkExportarCsv:  'a:has-text("Exportar para csv")',
  tabelaResultados: 'table tbody tr',
} as const;
```

### Robot / Orchestrator Pattern

O `ServidoresRobot` conhece **o quê** fazer mas não **como**. Cada step é delegado à page correspondente. Adicionar um novo fluxo (ex.: licitações) significa criar uma nova Page e um novo Robot sem tocar no código existente.

```typescript
async run(): Promise<string> {
  await this.navigateToServidores();
  await this.servidoresPage.fillYear(year);
  await this.servidoresPage.fillMonth(monthLabel);
  await this.servidoresPage.clickPesquisar();
  await this.servidoresPage.waitForResults();
  const csvPath = await this.servidoresPage.downloadCsv(year, monthNumber);
  return convertCsvToXlsx(csvPath);
}
```

### Download Race Condition — Promise.all

O evento de download do Playwright deve ter seu listener registrado **antes** do clique. O `Promise.all` garante essa ordem de forma segura:

```typescript
const [download] = await Promise.all([
  this.page.waitForEvent('download'), // listener registrado ANTES
  this.page.getByRole('link', { name: 'Exportar para csv' }).click(),
]);
await download.saveAs(outputPath);
```

---

## Estrutura de Pastas

```
rpa-franca-servidores/
│
├── src/
│   ├── config/
│   │   └── config.ts              # URLs, timeouts e flags centralizados
│   │
│   ├── pages/
│   │   ├── BasePage.ts            # Classe abstrata base com helpers genéricos
│   │   ├── HomePage.ts            # Página inicial da Prefeitura
│   │   ├── TransparencyPage.ts    # Portal da Transparência
│   │   └── ServidoresPage.ts      # Formulário + download do relatório
│   │
│   ├── robots/
│   │   └── ServidoresRobot.ts     # Orquestrador do fluxo completo
│   │
│   ├── utils/
│   │   ├── DateHelper.ts          # Cálculo de mês anterior (função pura)
│   │   ├── Logger.ts              # Logs com timestamp em arquivo e console
│   │   └── Converter.ts           # Bridge Node.js → Python para conversão
│   │
│   ├── scripts/
│   │   └── convert_to_xlsx.py     # Leitura do CSV e geração do XLSX via pandas
│   │
│   ├── logs/                      # Logs de execução e screenshots de erro (gitignored)
│   └── main.ts                    # Entry point — lifecycle do browser
│
├── output/                        # Arquivos CSV e XLSX gerados (gitignored)
│
├── .gitignore
├── package.json
├── playwright.config.ts
├── requirements.txt               # Dependências Python
├── tsconfig.json
└── README.md
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) **18+**
- [Python](https://www.python.org/downloads/) **3.8+** com `pip`
- `npm` (incluso no Node.js)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/rpa-franca-servidores.git
cd rpa-franca-servidores
```

### 2. Instale as dependências Node.js

```bash
npm install
```

### 3. Instale o browser Chromium do Playwright

```bash
npx playwright install chromium
```

### 4. Instale as dependências Python

```bash
pip install -r requirements.txt
```

---

## Configuração

Todas as configurações ficam em [src/config/config.ts](src/config/config.ts):

```typescript
export const CONFIG = {
  baseUrl:           'https://www3.franca.sp.gov.br/',
  transparencyUrl:   'https://webpmf.franca.sp.gov.br/portal-transparencia/',
  servidoresUrl:     'https://webpmf.franca.sp.gov.br/portal-transparencia/paginas/publica/servidores.xhtml',
  outputDir:         'output',
  logsDir:           'src/logs',
  timeout:           30_000,      // 30 segundos por operação
  ignoreHTTPSErrors: true,        // portal usa certificado auto-assinado
  headless:          false,       // true para rodar sem abrir janela
};
```

| Propriedade | Padrão | Descrição |
|---|---|---|
| `headless` | `false` | `true` para execução em servidor sem interface gráfica |
| `timeout` | `30000` | Tempo máximo de espera por elemento (ms) |
| `ignoreHTTPSErrors` | `true` | Necessário pelo certificado SSL do subdomínio |
| `outputDir` | `output` | Pasta de destino dos arquivos gerados |

---

## Execução

```bash
npm start
```

O robô irá:

1. Abrir o Chromium
2. Navegar até o Portal da Transparência
3. Preencher o formulário com o mês anterior automaticamente
4. Pesquisar e aguardar os resultados
5. Baixar o CSV
6. Converter para XLSX
7. Fechar o browser

---

## Output Gerado

Após a execução, a pasta `output/` conterá:

```
output/
├── servidores_2026_04.csv    # Arquivo original baixado do portal
└── servidores_2026_04.xlsx   # Arquivo convertido, pronto para Excel
```

### Estrutura do relatório

| Coluna | Descrição |
|---|---|
| Situação | Ativo / Afastado / Inativo |
| Matrícula | Número de matrícula do servidor |
| Nome | Nome completo |
| Cargo | Cargo efetivo |
| Salário base | Salário base bruto |
| Total vencimentos | Soma de todos os vencimentos |
| Total descontos | Soma de todos os descontos |
| Total líquido | Valor líquido recebido |
| Função inativa | Função anterior (quando aplicável) |
| Data de admissão | Data de ingresso no serviço público |
| Secretaria | Secretaria ou órgão de lotação |
| Jornada | Carga horária semanal |
| Referência | Nível/referência salarial |
| Data de afastamento | Data de afastamento (quando aplicável) |
| Data de demissão | Data de demissão (quando aplicável) |

> Exemplo de volume: competência Abril/2026 — **5.651 registros**

---

## Decisões Técnicas

### Por que Playwright e não Selenium?

O Playwright oferece suporte nativo a downloads, interceptação de rede, e tem API moderna baseada em `async/await`. O `waitForEvent('download')` com `Promise.all` resolve de forma elegante a race condition do botão de exportação — algo que no Selenium exigiria configurações de perfil de browser.

### Por que TypeScript?

Tipagem estática elimina erros em tempo de compilação. A interface `PreviousMonthYear` garante que `DateHelper` sempre retorne os três campos esperados. O `as const` no objeto de seletores e no CONFIG impede mutação acidental.

### Por que o portal usa `[id="..."]` em vez de `#id`?

O portal é construído em **JSF/PrimeFaces**, que gera IDs com `:` (ex.: `formFiltro:cbmAno:cmbInput_label`). O caractere `:` tem significado especial em CSS, quebrando seletores do tipo `#formFiltro:cbmAno`. A notação `[id="..."]` contorna isso de forma padrão.

### Por que Python para a conversão e não uma lib Node.js?

`pandas` + `openpyxl` é o padrão de mercado para manipulação de planilhas com controle preciso de encoding, tipos e formatação. O encoding UTF-8 do portal com separador vírgula e campos entre aspas foi tratado corretamente com os parâmetros `encoding="utf-8"`, `sep=","` e `quotechar='"'` — descobertos durante validação da estrutura real do arquivo.

### Por que `ignoreHTTPSErrors: true`?

O subdomínio `webpmf.franca.sp.gov.br` utiliza certificado SSL auto-assinado. Sem essa flag, o Playwright rejeita a conexão antes mesmo de carregar a página.

---

## Troubleshooting

### `python: command not found` ou `'python' is not recognized`

O Python não está no PATH do sistema. Soluções:

```bash
# Verifique se está instalado
python --version
# ou
python3 --version
```

Se necessário, instale pelo [site oficial](https://www.python.org/downloads/) marcando a opção **"Add Python to PATH"** durante a instalação. No Windows, pode ser necessário substituir `python` por `python3` no [src/utils/Converter.ts](src/utils/Converter.ts):

```typescript
execSync(`python3 "${scriptPath}" "${csvPath}"`, { stdio: 'inherit' });
```

---

### `Timeout exceeded` ao selecionar Ano ou Mês

O portal pode estar lento ou fora do ar. Aumente o timeout em [src/config/config.ts](src/config/config.ts):

```typescript
timeout: 60_000, // aumenta para 60 segundos
```

---

### O dropdown de Mês não habilita após selecionar o Ano

O portal usa AJAX encadeado — o Mês só aparece após o retorno do servidor. Se o `waitForNetworkIdle()` não for suficiente, adicione uma espera explícita em [src/pages/ServidoresPage.ts](src/pages/ServidoresPage.ts):

```typescript
async fillYear(year: string): Promise<void> {
  await this.page.click(this.selectors.dropdownAnoLabel);
  await this.page.getByRole('option', { name: year }).click();
  await this.page.waitForTimeout(2000); // espera o AJAX do Mês carregar
}
```

---

### `Error: net::ERR_CERT_AUTHORITY_INVALID`

O `ignoreHTTPSErrors` não está sendo aplicado. Confirme que o contexto é criado com essa flag em [src/main.ts](src/main.ts):

```typescript
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  acceptDownloads: true,
});
```

---

### O arquivo CSV é baixado mas está vazio ou corrompido

Verifique se o botão **"Exportar para csv"** só aparece após os resultados carregarem. O `waitForResults()` garante isso, mas se o portal mudou o texto do link, atualize o seletor em [src/pages/ServidoresPage.ts](src/pages/ServidoresPage.ts):

```typescript
linkExportarCsv: 'a:has-text("Exportar para csv")',
// ajuste o texto se necessário
```

---

## Roadmap

Funcionalidades planejadas para versões futuras:

| Status | Feature | Descrição |
|:---:|---|---|
| Planejado | Agendamento automático | Executar via Windows Task Scheduler ou cron (Linux) mensalmente |
| Planejado | Notificação por e-mail | Enviar o XLSX gerado por e-mail ao final da execução |
| Planejado | Módulo Licitações | Extrair dados da seção de Licitações e Editais do portal |
| Planejado | Módulo Despesas | Extrair empenhos e pagamentos por secretaria e período |
| Planejado | Módulo Receitas | Extrair arrecadação por categoria tributária (IPTU, ISS, etc.) |
| Planejado | Containerização | Dockerfile para execução em ambiente isolado sem dependências locais |
| Planejado | Dashboard | Relatório visual em HTML gerado automaticamente após a extração |

---

## Licença

MIT

---

## Autor

| | |
|---|---|
| **Nome** | Cauã Mendonça |
| **GitHub** | [github.com/seu-usuario](https://github.com/caua-mendonca) |
| **LinkedIn** | [linkedin.com/in/cauã-mendonça](https://www.linkedin.com/in/cauã-mendonça) |

---

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.44-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.0+-150458?style=flat-square&logo=pandas&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-F7DF1E?style=flat-square)
