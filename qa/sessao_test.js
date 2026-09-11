// ============================================================
// temvia — a sessão sobrevive a logout, novo login e troca de operação
//
// POR QUE ESTE ARQUIVO EXISTE
// O Milton reproduziu no ambiente real:
//     login → Evamo → MARLOG → Evamo            FUNCIONA
//     Sair → login de novo → trocar → Evamo     PEDE LOGIN OUTRA VEZ
//
// Nenhuma suíte via isso, e o motivo é instrutivo: o stub de Auth da bancada
// (qa/harness.js:79) devolve `currentUser` preenchido para QUALQUER instância.
// Com ele, sessão nunca se perde — nem quando o código a perde de verdade.
// É a armadilha "stub permissivo demais aprova qualquer coisa", do CLAUDE_V4.
//
// O stub aqui é fiel no que importa: o Firebase guarda a sessão em
// `firebase:authUser:<apiKey>:<nomeDaInstância>`. Instância diferente =
// sessão diferente. E a restauração é ASSÍNCRONA: onAuthStateChanged só
// dispara depois de ler o armazenamento, que é o que separa "não há sessão"
// de "a sessão ainda não chegou".
//
// O teste roda a sequência DUAS vezes: com o nome unificado (como está hoje)
// e com o nome por operação (como estava antes da Frente 03). A segunda
// execução tem de FALHAR — é ela que prova a relação de causa.
// ============================================================
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const BASE = 'https://app.temvia.com.br';
const API_KEY = 'AIzaSyBN1VE2mS5nn5LxfxWMqJyHSe1aDtwYiCE';

let ok = 0, fail = 0;
const t = (n, c, e) => {
  if (c === true) { console.log('OK    ' + n); ok++; }
  else { console.log('FALHA ' + n + '  → ' + (e !== undefined ? e : c)); fail++; }
};

// ---------------------------------------------------------------- stubs ----
const STUB_APP = `
const _apps = [];
export function initializeApp(cfg, nome) {
  const n = nome || '[DEFAULT]';
  const achado = _apps.find(a => a.name === n);
  if (achado) return achado;
  const app = { name: n, options: cfg };
  _apps.push(app);
  return app;
}
export function getApps() { return _apps.slice(); }
export function getApp(n) { return _apps.find(a => a.name === (n || '[DEFAULT]')); }
export function deleteApp(app) { const i = _apps.indexOf(app); if (i >= 0) _apps.splice(i, 1); return Promise.resolve(); }
`;

// A persistência real vive em IndexedDB, chaveada por apiKey + nome da
// instância. localStorage serve de espelho fiel o bastante: o que importa é
// que a chave seja a mesma e que ela atravesse navegação de página.
const STUB_AUTH = `
const CHAVE = a => 'firebase:authUser:' + (a.__app.options && a.__app.options.apiKey) + ':' + a.__app.name;
const ler = a => { try { const v = localStorage.getItem(CHAVE(a)); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const gravar = (a, u) => { try { u ? localStorage.setItem(CHAVE(a), JSON.stringify(u)) : localStorage.removeItem(CHAVE(a)); } catch (e) {} };

const _auths = {};
export function getAuth(app) {
  const n = app.name;
  if (_auths[n]) return _auths[n];
  const auth = {
    __app: app, app: app,
    currentUser: null,          // ainda NAO restaurado — de proposito
    __pronto: false, __ouvintes: []
  };
  // Restauracao assincrona, como no SDK: quem ler currentUser antes disto
  // ve null mesmo havendo sessao gravada.
  setTimeout(() => {
    auth.currentUser = ler(auth);
    auth.__pronto = true;
    auth.__ouvintes.slice().forEach(cb => { try { cb(auth.currentUser); } catch (e) {} });
  }, 0);
  _auths[n] = auth;
  return auth;
}
export function onAuthStateChanged(auth, cb) {
  auth.__ouvintes.push(cb);
  // O SDK so chama o callback DEPOIS de resolver o estado inicial.
  if (auth.__pronto) setTimeout(() => cb(auth.currentUser), 0);
  return function () { const i = auth.__ouvintes.indexOf(cb); if (i >= 0) auth.__ouvintes.splice(i, 1); };
}
function emitir(auth) {
  auth.__ouvintes.slice().forEach(cb => { try { cb(auth.currentUser); } catch (e) {} });
}
export async function signInWithEmailAndPassword(auth, email, senha) {
  if (senha !== 'senha-de-teste') { const e = new Error('auth/wrong-password'); e.code = 'auth/wrong-password'; throw e; }
  auth.currentUser = { uid: 'u-gestor', email: email, isAnonymous: false };
  auth.__pronto = true; gravar(auth, auth.currentUser); emitir(auth);
  return { user: auth.currentUser };
}
export async function signInAnonymously(auth) {
  auth.currentUser = { uid: 'u-anon-' + auth.__app.name, email: null, isAnonymous: true };
  auth.__pronto = true; gravar(auth, auth.currentUser); emitir(auth);
  return { user: auth.currentUser };
}
export async function signOut(auth) {
  auth.currentUser = null; auth.__pronto = true; gravar(auth, null); emitir(auth);
}
export async function createUserWithEmailAndPassword(auth, email) { return { user: { uid: 'novo', email } }; }
export async function sendPasswordResetEmail() {}
export async function setPersistence() {}
export const inMemoryPersistence = 'memoria';
export const browserLocalPersistence = 'local';
`;

const CATALOGO = {
  lista: ['evamo_temvia', 'marlog'],
  info: { evamo_temvia: { nome: 'Evamo' }, marlog: { nome: 'MARLOG' } }
};

const STUB_DB = `
const CAT = ${JSON.stringify(CATALOGO)};
export function getFirestore() { return { __db: true }; }
export function doc(db, col, id) { return { __c: col, __id: id }; }
export function collection(db, col) { return { __c: col }; }
function dados(ref) {
  if (ref.__c === '_plataforma' && ref.__id === 'operacoes') return CAT;
  if (ref.__c === '_acessos') return { papel: 'dono', operacoes: ['*'] };
  if (ref.__id === 'acessos') return { lista: [] };          // ninguem e 'cliente'
  if (ref.__id === 'dados')   return { DATA: [], MOTORISTAS: [], SEM_ROTA: [] };
  if (ref.__id === 'config')  return { empresa: { nome: 'Redentor' } };
  return {};
}
export async function getDoc(ref) {
  const d = dados(ref);
  return { exists: () => true, data: () => d, id: ref.__id };
}
export async function getDocs() { return { forEach() {}, docs: [], empty: true }; }
export async function setDoc() {} export async function updateDoc() {}
export async function addDoc() { return { id: 'x' }; } export async function deleteDoc() {}
export function onSnapshot(ref, cb) { try { cb({ exists: () => true, data: () => dados(ref) }); } catch (e) {} return function () {}; }
export function arrayUnion(...v) { return v; } export function increment(n) { return n; }
export function query() { return {}; } export function where() { return {}; } export function orderBy() { return {}; }
export function serverTimestamp() { return new Date().toISOString(); }
`;

// ------------------------------------------------------------- servidor ----
async function montarPagina(ctx, trocarAppNome) {
  const p = await ctx.newPage();
  p.on('dialog', d => d.accept());

  await p.route('**/firebasejs/**/firebase-app.js', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB_APP }));
  await p.route('**/firebasejs/**/firebase-auth.js', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB_AUTH }));
  await p.route('**/firebasejs/**/firebase-firestore.js', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body: STUB_DB }));
  await p.route('**/firebasejs/**/firebase-app-check.js', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript', body:
      'export function initializeAppCheck(){return{};} export function ReCaptchaV3Provider(){}' }));

  await p.route('**/cdnjs.cloudflare.com/**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await p.route('**/cdn.jsdelivr.net/**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await p.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.route('**/maps.googleapis.com/**', r => r.abort());

  // arquivos reais do repositório
  await p.route(BASE + '/**', r => {
    let rota = new URL(r.request().url()).pathname;
    if (rota.endsWith('/')) rota += 'index.html';
    const arq = path.join(ROOT, rota.replace(/^\//, '').split('?')[0]);
    if (!fs.existsSync(arq)) return r.fulfill({ status: 404, body: 'nao existe: ' + rota });
    let corpo = fs.readFileSync(arq, 'utf8');
    // Para a execução que prova a causa: devolve a casca da Evamo com o nome
    // de instância POR OPERAÇÃO, como era antes da Frente 03.
    if (trocarAppNome && /\/redentor\/evamo\/index\.html$/.test(rota)) {
      corpo = corpo.replace(/appNome: 'portal-redentor'/, "appNome: 'portal-redentor-evamo'");
    }
    const tipo = arq.endsWith('.css') ? 'text/css'
      : arq.endsWith('.js') ? 'application/javascript'
      : arq.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain';
    r.fulfill({ status: 200, contentType: tipo, body: corpo });
  });
  return p;
}

// O que importa em cada ponto do fluxo.
const OLHAR = `(() => {
  const chaves = [];
  try { for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.indexOf('firebase:authUser:') === 0) chaves.push(k.split(':').slice(3).join(':'));
  } } catch (e) {}
  const cfg = window.CLIENTE_CONFIG || {};
  const overlay = document.getElementById('loginOverlay');
  const caixa = document.getElementById('loginBox');
  return {
    url: location.pathname + location.search,
    appNome: cfg.appNome || '(portal)',
    instancias: chaves.sort(),
    pedindoLogin: !!(overlay && getComputedStyle(overlay).display !== 'none'
                     && caixa && getComputedStyle(caixa).display !== 'none'),
    noPortal: /\\/redentor\\/$|\\/redentor\\/index\\.html$/.test(location.pathname)
  };
})()`;

const pausa = (p, ms) => p.waitForTimeout(ms);

async function medir(p, rotulo, linha) {
  const e = await p.evaluate(OLHAR);
  linha.push({ ponto: rotulo, ...e });
  return e;
}

// ------------------------------------------------------------ o percurso ---
async function percurso(ctx, trocarAppNome, semear, guardarPagina) {
  const linha = [];
  const p = await montarPagina(ctx, trocarAppNome);

  // `semear` recria a condição do ambiente real do Milton: a instância da
  // operação JÁ tinha sessão, de um login feito direto na página da Evamo
  // antes de o portal existir. É isso que fazia o 1º ciclo funcionar.
  if (semear) {
    await p.goto(BASE + '/redentor/', { waitUntil: 'domcontentloaded' });
    await p.evaluate(k => localStorage.setItem(k, JSON.stringify(
      { uid: 'u-gestor', email: 'gestor@temvia.com.br', isAnonymous: false })),
      'firebase:authUser:' + API_KEY + ':portal-redentor-evamo');
  }

  const irPortal = async () => {
    await p.goto(BASE + '/redentor/', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => {
      const t = document.getElementById('tela');
      return t && (t.innerText.indexOf('Quem é você') >= 0 || t.innerText.indexOf('Entrar como Gestor') >= 0);
    }, null, { timeout: 20000 });
    // Espera o CATÁLOGO chegar antes de logar. Enquanto ele não chega, o
    // portal desta branch ainda exibe a lista estática do arquivo, e o login
    // varreria operações que não são as atuais — inclusive a DSV, que aponta
    // para outro projeto Firebase e criaria 'portal-redentor' com a config
    // errada (fbDe guarda uma instância por transportadora, com a config de
    // quem chegou primeiro). Medir depois do catálogo mede o fluxo real.
    await p.waitForFunction(() =>
      typeof TRANSPORTADORAS !== 'undefined' && TRANSPORTADORAS[0] &&
      TRANSPORTADORAS[0].operacoes.some(o => o.id === 'marlog'),
      null, { timeout: 20000 });
  };
  const logar = async () => {
    await p.evaluate(() => escolher('gestor'));
    await p.waitForSelector('#gEmail', { timeout: 10000 });
    await p.fill('#gEmail', 'gestor@temvia.com.br');
    await p.fill('#gSenha', 'senha-de-teste');
    await p.evaluate(() => gestorEntrar());
    await p.waitForFunction(() => {
      const t = document.getElementById('tela');
      return t && t.innerText.indexOf('Qual empresa vai gerenciar') >= 0;
    }, null, { timeout: 20000 });
  };
  // Abre a operação e espera o engine decidir: ou some o "Verificando acesso...",
  // ou a página foi trocada (redirecionada ao portal).
  const abrirOperacao = async (href) => {
    await p.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    await pausa(p, 1200);
  };

  await irPortal();                               await medir(p, 'A. portal antes do 1º login', linha);
  await logar();                                  await medir(p, 'B. após 1º login', linha);
  await abrirOperacao('/redentor/evamo/index.html');          await medir(p, 'C. Evamo, 1º acesso', linha);
  await abrirOperacao('/redentor/gestor.html?op=marlog');     await medir(p, 'D. MARLOG, 1º acesso', linha);
  await abrirOperacao('/redentor/evamo/index.html');          await medir(p, 'E. Evamo ao voltar', linha);

  const f = await medir(p, 'F. antes de Sair', linha);
  // Sair pelo próprio engine, como o gestor faz.
  if (!f.noPortal) { try { await p.evaluate(() => logout()); } catch (e) {} }
  await pausa(p, 900);                            await medir(p, 'G. depois de Sair', linha);

  await irPortal();                               await medir(p, 'H. portal antes do 2º login', linha);
  await logar();                                  await medir(p, 'I. após 2º login', linha);
  await abrirOperacao('/redentor/evamo/index.html');          await medir(p, 'J. Evamo após 2º login', linha);
  await abrirOperacao('/redentor/gestor.html?op=marlog');     await medir(p, 'K. MARLOG após 2º login', linha);
  await abrirOperacao('/redentor/evamo/index.html');          await medir(p, 'L. Evamo ao voltar (o defeito)', linha);

  if (guardarPagina) return { linha, p };
  await p.close();
  return { linha };
}

const perdeuSessao = e => e.pedindoLogin === true || e.noPortal === true;

(async () => {
  const b = await chromium.launch();

  // ---- 1. como está hoje: instância unificada ----
  const ctx1 = await b.newContext();
  const r1 = await percurso(ctx1, false, false, true);
  const hoje = r1.linha;

  console.log('\n--- percurso com a instância unificada (estado atual) ---');
  hoje.forEach(e => console.log('  ' + e.ponto.padEnd(32) +
    ' inst=' + String(e.appNome).padEnd(18) +
    ' guardadas=[' + e.instancias.join(',') + ']' +
    (perdeuSessao(e) ? '  ← SEM SESSÃO' : '')));

  const emC = hoje.find(e => e.ponto[0] === 'C');
  const emE = hoje.find(e => e.ponto[0] === 'E');
  const emJ = hoje.find(e => e.ponto[0] === 'J');
  const emL = hoje.find(e => e.ponto[0] === 'L');
  const emG = hoje.find(e => e.ponto[0] === 'G');

  t('caso 1 — 1º ciclo: Evamo abre sem pedir login', !perdeuSessao(emC), JSON.stringify(emC));
  t('caso 1 — 1º ciclo: Evamo ao voltar da MARLOG', !perdeuSessao(emE), JSON.stringify(emE));
  t('caso 2 — 2º ciclo: Evamo abre após novo login', !perdeuSessao(emJ), JSON.stringify(emJ));
  t('caso 2 — 2º ciclo: Evamo ao voltar da MARLOG (o defeito)', !perdeuSessao(emL), JSON.stringify(emL));
  t('caso 3 — Sair realmente encerra a sessão',
    emG.instancias.indexOf('portal-redentor') < 0,
    'sobraram: [' + emG.instancias.join(',') + '] — logout precisa continuar sendo logout');
  t('caso 6 — nenhuma instância por operação aparece',
    hoje.every(e => !e.instancias.some(k => /^portal-redentor-.+/.test(k))),
    JSON.stringify([...new Set(hoje.flatMap(e => e.instancias))]));

  // ---- caso 4: refresh na Evamo, depois do 2º login ----
  await r1.p.reload({ waitUntil: 'domcontentloaded' });
  await pausa(r1.p, 1200);
  const refresh = await r1.p.evaluate(OLHAR);
  t('caso 4 — refresh na Evamo restaura a sessão', !perdeuSessao(refresh), JSON.stringify(refresh));

  // ---- caso 5: nova aba na mesma sessão do navegador ----
  const p2 = await montarPagina(ctx1, false);
  await p2.goto(BASE + '/redentor/evamo/index.html', { waitUntil: 'domcontentloaded' });
  await pausa(p2, 1200);
  const novaAba = await p2.evaluate(OLHAR);
  t('caso 5 — nova aba reconhece a sessão (browserLocalPersistence)',
    !perdeuSessao(novaAba), JSON.stringify(novaAba));
  await p2.close();
  await ctx1.close();

  // ---- resíduo da unificação: sessão ANÔNIMA na instância do gestor ----
  // Antes, garantirSessao() gravava o anônimo em 'portal-redentor-evamo', que
  // o portal nunca consultava. Com a instância unificada ele cai em
  // 'portal-redentor' — a mesma que o portal usa para decidir se há login.
  // Se o portal aceitar um usuário anônimo como sessão aberta, o "Continuar
  // de onde parou" manda para a operação, a operação recusa o anônimo e
  // devolve ao portal: laço.
  const ctx4 = await b.newContext();
  const p4 = await montarPagina(ctx4, false);
  await p4.goto(BASE + '/redentor/evamo/index.html', { waitUntil: 'domcontentloaded' });
  await pausa(p4, 1500);
  const semLogin = await p4.evaluate(OLHAR);
  const anonNaInstanciaDoGestor = await p4.evaluate(k => {
    try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ? !!v.isAnonymous : null; }
    catch (e) { return null; }
  }, 'firebase:authUser:' + API_KEY + ':portal-redentor');

  // O portal decide com sessaoAberta(); pergunta-se a ele, não ao armazenamento.
  await p4.goto(BASE + '/redentor/', { waitUntil: 'domcontentloaded' });
  await pausa(p4, 1200);
  // O `op` precisa carregar a MESMA config que o portal usa: a chave de
  // persistência é apiKey + nome da instância. Com `fb: null` a chave não
  // casa, sessaoAberta devolve false por não achar nada, e a verificação
  // passaria sem medir coisa alguma — teste que mente ao contrário.
  const portalAcha = await p4.evaluate(async (apiKey) => {
    try {
      return await sessaoAberta({ transpId: 'redentor', fb: {
        apiKey: apiKey, authDomain: 'evamo-transporte.firebaseapp.com',
        projectId: 'evamo-transporte' } });
    } catch (e) { return 'erro: ' + e.message; }
  }, API_KEY);
  await p4.close(); await ctx4.close();

  t('quem abre a operação sem login é devolvido ao portal',
    perdeuSessao(semLogin), JSON.stringify(semLogin));
  t('o portal NÃO confunde sessão anônima com gestor logado',
    portalAcha === false,
    'anônimo em portal-redentor=' + anonNaInstanciaDoGestor +
    ' · sessaoAberta devolveu ' + portalAcha +
    ' — "Continuar de onde parou" mandaria para a operação, que recusa e devolve: laço');

  // ---- 2. com o nome por operação: tem de reprovar ----
  const ctx2 = await b.newContext();
  const antes = (await percurso(ctx2, true, false)).linha;
  await ctx2.close();

  console.log('\n--- percurso com nome POR OPERAÇÃO (como era antes da Frente 03) ---');
  antes.forEach(e => console.log('  ' + e.ponto.padEnd(32) +
    ' inst=' + String(e.appNome).padEnd(18) +
    ' guardadas=[' + e.instancias.join(',') + ']' +
    (perdeuSessao(e) ? '  ← SEM SESSÃO' : '')));

  const antesL = antes.find(e => e.ponto[0] === 'L');
  const antesC = antes.find(e => e.ponto[0] === 'C');
  // Verificação NEGATIVA: se isto PASSAR, o teste não está medindo o que diz.
  t('a causa está provada: com nome por operação, a Evamo perde a sessão',
    perdeuSessao(antesC) || perdeuSessao(antesL),
    'o percurso antigo passou — então não é o nome da instância, e a causa continua desconhecida');

  // ---- 3. o relato exato do Milton: nome por operação COM sessão herdada ----
  // Num navegador que já tinha sessão em 'portal-redentor-evamo' (de um login
  // feito direto na página da Evamo, antes de o portal unificar), o 1º ciclo
  // FUNCIONA e só o 2º quebra — que é precisamente o que foi relatado.
  const ctx3 = await b.newContext();
  const herdado = (await percurso(ctx3, true, true)).linha;
  await ctx3.close();

  console.log('\n--- percurso relatado: nome por operação COM sessão herdada ---');
  herdado.forEach(e => console.log('  ' + e.ponto.padEnd(32) +
    ' inst=' + String(e.appNome).padEnd(18) +
    ' guardadas=[' + e.instancias.join(',') + ']' +
    (perdeuSessao(e) ? '  ← SEM SESSÃO' : '')));

  const hC = herdado.find(e => e.ponto[0] === 'C');
  const hE = herdado.find(e => e.ponto[0] === 'E');
  const hL = herdado.find(e => e.ponto[0] === 'L');

  t('o relato reproduz: 1º ciclo funciona com a sessão herdada',
    !perdeuSessao(hC) && !perdeuSessao(hE),
    'C=' + JSON.stringify(hC) + ' E=' + JSON.stringify(hE));
  t('o relato reproduz: 2º ciclo quebra depois de Sair',
    perdeuSessao(hL),
    'L=' + JSON.stringify(hL) + ' — se não quebrou, a explicação do defeito está errada');

  await b.close();
  console.log('\n----------------------------------------');
  console.log(ok + '/' + (ok + fail) + ' verificações de sessão OK');
  process.exit(fail ? 1 : 0);
})();
