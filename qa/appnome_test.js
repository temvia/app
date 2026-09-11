// ============================================================
// temvia — a instância Auth não volta a ser por operação
//
// POR QUE ESTE ARQUIVO EXISTE
// O Firebase guarda a sessão por NOME DE INSTÂNCIA (a persistência padrão
// é browserLocal, chaveada por apiKey + nome do app). Nome diferente =
// sessão diferente. Quando o portal passou a usar 'portal-redentor' e as
// pastas próprias ficaram em 'portal-redentor-evamo', o gestor entrava no
// portal e caía numa página que não enxergava a sessão — login duas vezes.
//
// O casca_generica_test já vigiava isso, mas SÓ nas quatro cascas
// genéricas. As pastas próprias, que eram justamente as divergentes,
// ficavam de fora. Aqui a varredura é do diretório inteiro: pasta nova
// entra sozinha.
//
// O QUE ESTE TESTE NÃO EXIGE, de propósito:
// Motorista e Passageiro NÃO convergem para a instância do gestor. Eles
// entram por sessão anônima, e garantirSessao() só chama signInAnonymously
// quando NÃO há usuário — então, numa instância compartilhada com um gestor
// logado no mesmo navegador, o app do motorista rodaria COM A CONTA DO
// GESTOR. O isolamento é proteção, não descuido. Aqui ele é fixado como
// característica, para que deixar de valer apareça.
// ============================================================
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const TRANSPORTADORA = 'redentor';
const ESPERADO = 'portal-' + TRANSPORTADORA;

// A regra é "uma instância Auth por transportadora" DENTRO do projeto Firebase
// dela. Uma casca que aponta para OUTRO projeto vive noutro universo de
// sessão: a persistência é chaveada por apiKey + nome da instância, então o
// nome dela não pode colidir com a sessão do gestor nem herdá-la.
//
// É o caso de redentor/dsv/, que aponta para 'redentor-transporte-11808'.
// A pasta está morta e a remoção dela é de outra frente — aqui ela é
// declarada fora do escopo por PROJETO, não por caminho, para que uma pasta
// nova apontando para o projeto da transportadora continue sendo cobrada.
const PROJETO_DA_TRANSPORTADORA = 'evamo-transporte';

let ok = 0, fail = 0;
const t = (n, c, e) => {
  if (c === true) { console.log('OK    ' + n); ok++; }
  else { console.log('FALHA ' + n + '  → ' + (e !== undefined ? e : c)); fail++; }
};

// ---- descobre as cascas, sem lista fixa ----
const DIR = path.join(ROOT, 'redentor');
function cascas(dir, achadas) {
  achadas = achadas || [];
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    if (fs.statSync(p).isDirectory()) cascas(p, achadas);
    else if (nome.endsWith('.html')) achadas.push(p);
  }
  return achadas;
}

// O perfil vem do ENGINE que a casca carrega, não do nome do arquivo:
// na pasta própria o gestor se chama index.html, na genérica gestor.html.
function perfilDe(src) {
  if (/motor\/(beta\/)?gestor\.js/.test(src))     return 'gestor';
  if (/motor\/(beta\/)?cliente\.js/.test(src))    return 'cliente';
  if (/motor\/(beta\/)?motorista\.js/.test(src))  return 'motorista';
  if (/motor\/(beta\/)?passageiro\.js/.test(src)) return 'passageiro';
  if (/carregarCatalogo|TRANSPORTADORA_ID/.test(src)) return 'portal';
  return 'desconhecido';
}

// Resolve o valor declarado para o nome que o navegador vai usar.
function nomeDeclarado(src) {
  // A forma concatenada vem PRIMEIRO: em `appNome: 'portal-' + TRANSPORTADORA`
  // a regex do literal casaria o pedaço `'portal-'` e devolveria um nome
  // truncado. Foi o que este teste acusou de si mesmo na primeira execução.
  if (/appNome:\s*'portal-'\s*\+\s*TRANSPORTADORA/.test(src)) {
    return 'portal-' + TRANSPORTADORA;           // a casca define TRANSPORTADORA='redentor'
  }
  const m = src.match(/appNome:\s*'([^']+)'\s*,/);
  return m ? m[1] : null;
}

const arquivos = cascas(DIR);
t('as cascas foram encontradas', arquivos.length >= 8, arquivos.length + ' arquivos');

// ---- 1. Portal, Gestor e Cliente: UMA instância por transportadora ----
const AUTENTICADOS = ['portal', 'gestor', 'cliente'];
const nomesVistos = new Set();

for (const arq of arquivos) {
  const src = fs.readFileSync(arq, 'utf8');
  const rel = path.relative(ROOT, arq).replace(/\\/g, '/');
  const perfil = perfilDe(src);
  if (AUTENTICADOS.indexOf(perfil) < 0) continue;

  // Fora do escopo por apontar para outro projeto Firebase — anunciado,
  // nunca omitido em silêncio.
  const proj = (src.match(/projetoEsperado:\s*'([^']+)'/) || [])[1];
  if (proj && proj !== PROJETO_DA_TRANSPORTADORA) {
    console.log('FORA  ' + path.relative(ROOT, arq).replace(/\\/g, '/') +
      ' (' + perfil + ') aponta para ' + proj + ', não para ' +
      PROJETO_DA_TRANSPORTADORA + ' — outro universo de sessão');
    continue;
  }

  const nome = nomeDeclarado(src);

  if (perfil === 'portal') {
    // O portal monta o nome em código, não em CLIENTE_CONFIG.
    t(rel + ' (portal) monta a instância por TRANSPORTADORA',
      /const nome\s*=\s*'portal-'\s*\+\s*\(?\s*op\.transpId/.test(src),
      'voltou a montar o nome com a operação (op.key) — separa a sessão do portal das cascas');
    nomesVistos.add(ESPERADO);
    continue;
  }

  t(rel + ' (' + perfil + ') declara appNome', nome !== null,
    'sem appNome o engine cai em instância indefinida');
  if (nome === null) continue;

  t(rel + ' (' + perfil + ') usa ' + ESPERADO, nome === ESPERADO, nome);

  // Verificação NEGATIVA: qualquer sufixo depois da transportadora é
  // nome por operação voltando. Uma igualdade sozinha passaria se alguém
  // trocasse a constante ESPERADO junto com as cascas.
  t(rel + ' (' + perfil + ') NÃO carrega sufixo de operação',
    !new RegExp('^portal-' + TRANSPORTADORA + '-.+').test(nome),
    nome + ' — nome por operação derruba o login ao trocar de operação');

  nomesVistos.add(nome);
}

t('Portal, Gestor e Cliente convergem para UMA instância',
  nomesVistos.size === 1, [...nomesVistos].join(' | '));

// ---- 2. Motorista e Passageiro: isolamento anônimo, fixado ----
// Não é exigência de convergência — é o contrário: se um dia passarem a
// usar a instância do gestor, isto falha e a decisão volta à mesa.
const motorista = fs.readFileSync(path.join(ROOT, 'motor', 'motorista.js'), 'utf8');
const passageiro = fs.readFileSync(path.join(ROOT, 'motor', 'passageiro.js'), 'utf8');

t('motorista.js mantém instância anônima própria, separada do gestor',
  /FB_APP_NOME_MOT\s*=\s*'motorista-'\s*\+\s*CLIENTE_ID/.test(motorista),
  'se passar a usar a instância do gestor, herda a sessão dele — decisão precisa ser reavaliada');

t('passageiro.js mantém instância anônima própria, separada do gestor',
  /initializeApp\(FB_CONFIG\)\s*;/.test(passageiro) &&
  !/initializeApp\(FB_CONFIG,\s*C\.appNome/.test(passageiro),
  'idem motorista');

// E a razão do isolamento, fixada onde ela mora:
t('garantirSessao só entra como anônimo quando NÃO há usuário',
  /if \(!auth\.currentUser\) await authLib\.signInAnonymously\(auth\)/
    .test(fs.readFileSync(path.join(ROOT, 'motor', 'comum.js'), 'utf8')),
  'é esta linha que faz instância compartilhada virar "o motorista roda como o gestor"');

console.log('\n----------------------------------------');
console.log(ok + '/' + (ok + fail) + ' verificações de instância Auth OK');
process.exit(fail ? 1 : 0);
