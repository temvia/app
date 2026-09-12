// ============================================================
// temvia — suíte de ATAQUE às Firestore Rules
//
// POR QUE ESTE ARQUIVO EXISTE
// A auditoria do RELATORIO_03 foi feita LENDO as Rules. Leitura de regra não
// é prova: quem decide é o avaliador do Firestore. Aqui cada achado vira um
// ataque executado contra o Emulator, com o veredito ALLOW/DENY medido.
//
// NUNCA aponta para produção. O Emulator é local e os dados são fictícios.
//
// COMO RODAR
//   npm run qa:seguranca
// Pré-requisito: Java 21+ no PATH. O firebase-tools 15 recusa versões
// anteriores ("no longer supports Java version before 21"), e o Emulator do
// Firestore é um JAR. Ver qa/seguranca/README.md.
//
// FOCO: PLATAFORMA NOVA.
// O legado Evamo está CONGELADO por decisão do Milton — nem corrigir, nem
// derrubar, até a migração. Os testes de /evamo e /evamo_pins continuam
// aqui, mas como GUARDA: eles fixam o comportamento atual para que uma
// mudança na plataforma nova não o altere sem querer. Onde eles medem uma
// permissão folgada, isso está anotado como dívida aceita, não como falha.
//
// Cada verificação declara o esperado POR CONJUNTO DE REGRAS:
//   { atual: 'ALLOW', candidata: 'DENY' }  → a candidata fecha o buraco
//   { atual: 'ALLOW', candidata: 'ALLOW' } → acesso legítimo, não pode sumir
// É a diferença entre as duas colunas que mostra o que a candidata muda.
// ============================================================
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc
} = require('firebase/firestore');

const RAIZ = __dirname;
const ARQ = {
  operacional: {
    atual: path.join(RAIZ, 'firestore_generico_evamo-transporte.rules'),
    candidata: path.join(RAIZ, 'firestore_generico_evamo-transporte.CANDIDATE.rules')
  },
  central: {
    atual: path.join(RAIZ, 'firestore_central_temvia-central.rules'),
    candidata: path.join(RAIZ, 'firestore_central_temvia-central.CANDIDATE.rules')
  }
};

// ---- dados FICTÍCIOS. Nenhum telefone, nome ou endereço real entra aqui. ----
const TEL_FICTICIO = '11900000001';
const TEL_FICTICIO_2 = '11900000002';
const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

const medidas = [];   // { grupo, nome, esperado{}, obtido{} }
let conjuntoAtivo = null;

function registrar(grupo, nome, esperado, obtido) {
  let m = medidas.find(x => x.grupo === grupo && x.nome === nome);
  if (!m) { m = { grupo, nome, esperado, obtido: {} }; medidas.push(m); }
  m.obtido[conjuntoAtivo] = obtido;
}

async function veredito(promessa) {
  try { await promessa; return 'ALLOW'; }
  catch (e) { return 'DENY'; }
}

async function semear(testEnv, seed) {
  await testEnv.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    for (const [caminho, dados] of seed) {
      const p = caminho.split('/');
      await setDoc(doc(db, p[0], p[1]), dados);
    }
  });
}

// ===================== PROJETO OPERACIONAL =====================
async function bateriaOperacional(conjunto, arquivoRules) {
  if (!fs.existsSync(arquivoRules)) return;
  conjuntoAtivo = conjunto;
  console.log('\n================ OPERACIONAL · ' + conjunto + ' ================');

  const testEnv = await initializeTestEnvironment({
    projectId: 'temvia-operacional-' + conjunto.toLowerCase(),
    firestore: { rules: fs.readFileSync(arquivoRules, 'utf8'), host: '127.0.0.1', port: 8080 }
  });
  await testEnv.clearFirestore();

  await semear(testEnv, [
    ['_plataforma/operacoes', { lista: ['evamo_temvia', 'evamo_teste', 'marlog', 'fabrica'] }],
    ['_acessos/gestorA', { papel: 'gestor', operacoes: ['evamo_temvia'] }],
    ['_acessos/gestorB', { papel: 'gestor', operacoes: ['marlog'] }],
    ['_acessos/dono', { papel: 'dono', operacoes: ['*'] }],
    ['evamo/dados', { DATA: [] }],
    ['evamo/presencas', { lista: [] }],
    ['evamo_pins/' + TEL_FICTICIO, { hash: HASH_A }],
    ['evamo_temvia/dados', { DATA: [] }],
    ['evamo_temvia/config', { empresa: 'ficticia' }],
    ['evamo_temvia/pins_ativos', { lista: [TEL_FICTICIO, TEL_FICTICIO_2] }],
    ['evamo_temvia/presencas', { lista: [] }],
    ['evamo_temvia/avisos', { lista: [] }],
    ['marlog/dados', { DATA: [] }],
    ['marlog/pins_ativos', { lista: [TEL_FICTICIO_2] }],
    ['marlog/presencas', { lista: [] }],
    ['fabrica/dados', { DATA: [] }]
  ]);

  const semAuth = testEnv.unauthenticatedContext().firestore();
  const anonA = testEnv.authenticatedContext('anonA', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const anonB = testEnv.authenticatedContext('anonB', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const gestorA = testEnv.authenticatedContext('gestorA', { firebase: { sign_in_provider: 'password' } }).firestore();
  const gestorB = testEnv.authenticatedContext('gestorB', { firebase: { sign_in_provider: 'password' } }).firestore();
  const gestorSem = testEnv.authenticatedContext('gestorSem', { firebase: { sign_in_provider: 'password' } }).firestore();

  const R = async (g, n, esp, p) => registrar(g, n, esp, await veredito(p));
  const IGUAL = v => ({ atual: v, candidata: v });
  const FECHA = { atual: 'ALLOW', candidata: 'DENY' };

  // ---------- LEGADO: guarda. Congelado; medir, não mexer ----------
  await R('legado', 'UNAUTH GET /evamo/dados (invariável sagrada)', IGUAL('ALLOW'),
    getDoc(doc(semAuth, 'evamo', 'dados')));
  await R('legado', 'UNAUTH SET /evamo/presencas (o legado precisa)', IGUAL('ALLOW'),
    setDoc(doc(semAuth, 'evamo', 'presencas'), { lista: [] }));
  await R('legado', 'UNAUTH SET /evamo/documento_inventado [dívida aceita]', IGUAL('ALLOW'),
    setDoc(doc(semAuth, 'evamo', 'documento_inventado'), { x: 1 }));
  await R('legado', 'UNAUTH SET /evamo/dados (doc de gestor) já é negado hoje', IGUAL('DENY'),
    setDoc(doc(semAuth, 'evamo', 'dados'), { DATA: ['injetado'] }));
  await R('legado', 'anônimo troca hash de /evamo_pins [dívida aceita]', IGUAL('ALLOW'),
    updateDoc(doc(anonA, 'evamo_pins', TEL_FICTICIO), { hash: HASH_B }));

  // ---------- PLATAFORMA NOVA: escrita anônima ----------
  await R('nova/escrita', 'anônimo publica AVISO falso para todos os passageiros', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'avisos'), { lista: [{ txt: 'falso' }] }));
  await R('nova/escrita', 'anônimo escreve documento INVENTADO', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'documento_inventado'), { x: 1 }));
  await R('nova/escrita', 'anônimo escreve reclamacoes', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'reclamacoes'), { lista: [] }));
  await R('nova/escrita', 'anônimo escreve solicitacoes_cadastro', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'solicitacoes_cadastro'), { lista: [] }));
  await R('nova/escrita', 'anônimo escreve uso_2026-09 (telemetria de custo)', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'uso_2026-09'), { eventos: [] }));

  // ---------- o que NÃO pode sumir: os apps anônimos de verdade ----------
  await R('nova/legítimo', 'passageiro marca presença', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'presencas'), { lista: [] }));
  await R('nova/legítimo', 'motorista grava viagem_X', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'viagem_r1_ida'), { eventos: [] }));
  await R('nova/legítimo', 'motorista grava horarios_do_dia', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'horarios_do_dia'), { lista: [] }));
  await R('nova/legítimo', 'motorista registra ocorrência', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'ocorrencias'), { lista: [] }));
  await R('nova/legítimo', 'passageiro grava rastreador', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'rastreador'), { pos: {} }));
  await R('nova/legítimo', 'passageiro avalia a viagem', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'avaliacoes'), { lista: [] }));
  await R('nova/legítimo', 'chat da linha', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'chat_1_1'), { msgs: [] }));
  await R('nova/legítimo', 'trilha aceita inserção', IGUAL('ALLOW'),
    addDoc(collection(anonA, 'evamo_temvia_auditoria'), { evento: 'x', em: 'y' }));

  // ---------- pins_ativos ----------
  await R('nova/pins_ativos', 'anônimo LÊ a lista [bloqueio arquitetural]', IGUAL('ALLOW'),
    getDoc(doc(anonA, 'evamo_temvia', 'pins_ativos')));
  await R('nova/pins_ativos', 'anônimo ATIVA (a lista cresce)', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'evamo_temvia', 'pins_ativos'), { lista: [TEL_FICTICIO, TEL_FICTICIO_2, '11900000003'] }));
  await R('nova/pins_ativos', 'anônimo APAGA a lista (sabotagem)', FECHA,
    setDoc(doc(anonA, 'evamo_temvia', 'pins_ativos'), { lista: [] }));
  await R('nova/pins_ativos', 'gestor REVOGA (a lista encolhe)', IGUAL('ALLOW'),
    setDoc(doc(gestorA, 'evamo_temvia', 'pins_ativos'), { lista: [TEL_FICTICIO] }));

  // ---------- isolamento entre operações ----------
  await R('nova/cruzado', 'anônimo LÊ outra operação [bloqueio arquitetural]', IGUAL('ALLOW'),
    getDoc(doc(anonA, 'marlog', 'dados')));
  await R('nova/cruzado', 'gestor de A LÊ operação B [bloqueio arquitetural]', IGUAL('ALLOW'),
    getDoc(doc(gestorA, 'marlog', 'dados')));
  await R('nova/cruzado', 'anônimo ESCREVE presenças de outra operação', IGUAL('ALLOW'),
    setDoc(doc(anonB, 'marlog', 'presencas'), { lista: ['injetado'] }));
  await R('nova/cruzado', 'anônimo escreve documento inventado em OUTRA operação', FECHA,
    setDoc(doc(anonB, 'marlog', 'inventado'), { x: 1 }));
  await R('nova/cruzado', 'gestor de A escreve cadastro de B', IGUAL('DENY'),
    setDoc(doc(gestorA, 'marlog', 'dados'), { DATA: [] }));
  await R('nova/cruzado', 'gestor de A escreve config de B', IGUAL('DENY'),
    setDoc(doc(gestorA, 'marlog', 'config'), { empresa: 'x' }));

  // ---------- gestor: o que precisa continuar ----------
  await R('nova/gestor', 'gestorA escreve cadastro da própria operação', IGUAL('ALLOW'),
    setDoc(doc(gestorA, 'evamo_temvia', 'dados'), { DATA: [] }));
  await R('nova/gestor', 'gestorA escreve config da própria operação', IGUAL('ALLOW'),
    setDoc(doc(gestorA, 'evamo_temvia', 'config'), { empresa: 'x' }));
  await R('nova/gestor', 'gestorA publica aviso na própria operação', IGUAL('ALLOW'),
    setDoc(doc(gestorA, 'evamo_temvia', 'avisos'), { lista: [] }));
  await R('nova/gestor', 'gestorB escreve na própria operação', IGUAL('ALLOW'),
    setDoc(doc(gestorB, 'marlog', 'dados'), { DATA: [] }));
  await R('nova/gestor', 'conta sem registro em _acessos não administra', IGUAL('DENY'),
    setDoc(doc(gestorSem, 'evamo_temvia', 'dados'), { DATA: [] }));
  await R('nova/gestor', 'anônimo NÃO escreve documento de gestor', IGUAL('DENY'),
    setDoc(doc(anonA, 'evamo_temvia', 'config'), { empresa: 'x' }));
  await R('nova/gestor', 'coleção não registrada é recusada', IGUAL('DENY'),
    setDoc(doc(gestorA, 'inventada', 'dados'), { x: 1 }));
  await R('nova/gestor', 'trilha não se apaga nem pelo gestor', IGUAL('DENY'),
    deleteDoc(doc(gestorA, 'evamo_temvia_auditoria', 'qualquer')));
  await R('nova/gestor', '<op>_pins nunca é legível', IGUAL('DENY'),
    getDoc(doc(anonA, 'evamo_temvia_pins', 'pax_x')));

  await testEnv.cleanup();
}

// ======================= PROJETO CENTRAL =======================
async function bateriaCentral(conjunto, arquivoRules) {
  if (!fs.existsSync(arquivoRules)) return;
  conjuntoAtivo = conjunto;
  console.log('\n================ CENTRAL · ' + conjunto + ' ================');

  const testEnv = await initializeTestEnvironment({
    projectId: 'temvia-central-' + conjunto.toLowerCase(),
    firestore: { rules: fs.readFileSync(arquivoRules, 'utf8'), host: '127.0.0.1', port: 8080 }
  });
  await testEnv.clearFirestore();

  await semear(testEnv, [
    ['roteamento/hash_existente', { t: 'redentor', em: '2026-01-01' }],
    ['uso/redentor_evamo_2026-09', { chamadas: 10, elementos: 100, custoEstimado: 0.5 }]
  ]);

  const anonA = testEnv.authenticatedContext('anonA', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const anonB = testEnv.authenticatedContext('anonB', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const R = async (g, n, esp, p) => registrar(g, n, esp, await veredito(p));
  const IGUAL = v => ({ atual: v, candidata: v });
  const FECHA = { atual: 'ALLOW', candidata: 'DENY' };

  await R('roteamento', 'get de documento conhecido', IGUAL('ALLOW'),
    getDoc(doc(anonA, 'roteamento', 'hash_existente')));
  await R('roteamento', 'LIST da coleção é proibido', IGUAL('DENY'),
    getDocs(collection(anonA, 'roteamento')));
  await R('roteamento', 'primeiro create (registro no 1º acesso)', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'roteamento', 'hash_novo'), { t: 'redentor', em: '2026-01-01' }));
  await R('roteamento', 'sobrescrever entrada existente (sequestro)', IGUAL('DENY'),
    setDoc(doc(anonB, 'roteamento', 'hash_existente'), { t: 'outra', em: 'x' }));
  await R('roteamento', 'campo fora do contrato', IGUAL('DENY'),
    setDoc(doc(anonA, 'roteamento', 'hash_y'), { t: 'redentor', em: 'x', telefone: TEL_FICTICIO }));
  await R('roteamento', 'pré-registro de terceiro para tenant errado [aceito]', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'roteamento', 'hash_de_terceiro'), { t: 'errada', em: 'x' }));

  await R('uso', 'leitura é de ninguém', IGUAL('DENY'),
    getDoc(doc(anonA, 'uso', 'redentor_evamo_2026-09')));
  await R('uso', 'registro válido continua entrando', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'uso', 'redentor_marlog_2026-09'),
      { chamadas: 1, elementos: 10, custoEstimado: 0.05 }));
  await R('uso', 'SOBRESCREVE para baixo (apaga consumo medido)', FECHA,
    setDoc(doc(anonA, 'uso', 'redentor_evamo_2026-09'),
      { chamadas: 0, elementos: 0, custoEstimado: 0 }));
  await R('uso', 'valores negativos', FECHA,
    setDoc(doc(anonA, 'uso', 'redentor_evamo_2026-10'),
      { chamadas: -5, elementos: -5, custoEstimado: -5 }));
  await R('uso', 'PII arbitrária num documento que ninguém lê', FECHA,
    setDoc(doc(anonA, 'uso', 'redentor_evamo_2026-11'),
      { chamadas: 1, elementos: 1, custoEstimado: 0, telefone: TEL_FICTICIO }));
  await R('uso', 'tenant ARBITRÁRIO [não resolvível sem backend]', IGUAL('ALLOW'),
    setDoc(doc(anonA, 'uso', 'outra_transportadora_2026-09'),
      { chamadas: 1, elementos: 1, custoEstimado: 0 }));
  await R('uso', 'apagar é proibido', IGUAL('DENY'),
    deleteDoc(doc(anonA, 'uso', 'redentor_evamo_2026-09')));

  await testEnv.cleanup();
}

// ================================ execução ================================
(async () => {
  await bateriaOperacional('ATUAL', ARQ.operacional.atual);
  await bateriaOperacional('CANDIDATA', ARQ.operacional.candidata);
  await bateriaCentral('ATUAL', ARQ.central.atual);
  await bateriaCentral('CANDIDATA', ARQ.central.candidata);

  console.log('\n' + '='.repeat(96));
  console.log('MEDIDO — ' + 'verificação'.padEnd(56) + 'ATUAL'.padEnd(10) + 'CAND.'.padEnd(10) + 'veredito');
  console.log('='.repeat(96));

  let conforme = 0, divergente = 0, naoFechou = 0;
  let grupoAnterior = '';
  for (const m of medidas) {
    if (m.grupo !== grupoAnterior) { console.log('\n[' + m.grupo + ']'); grupoAnterior = m.grupo; }
    const a = m.obtido.ATUAL || '—', c = m.obtido.CANDIDATA || '—';
    const okA = a === m.esperado.atual;
    const okC = c === m.esperado.candidata;
    let v;
    if (okA && okC) { v = 'ok'; conforme++; }
    else if (!okC && m.esperado.candidata === 'DENY' && c === 'ALLOW') { v = '*** NÃO FECHOU'; naoFechou++; }
    else if (!okC && m.esperado.candidata === 'ALLOW' && c === 'DENY') { v = '*** REGRESSÃO'; divergente++; }
    else { v = '*** diverge do lido (' + m.esperado.atual + '/' + m.esperado.candidata + ')'; divergente++; }
    console.log('  ' + m.nome.slice(0, 54).padEnd(56) + a.padEnd(10) + c.padEnd(10) + v);
  }

  console.log('\n' + '-'.repeat(96));
  console.log('conforme o previsto: ' + conforme +
    '   buracos que a candidata NÃO fechou: ' + naoFechou +
    '   divergências: ' + divergente);
  console.log('-'.repeat(96));
  console.log('Uma linha "REGRESSÃO" é acesso legítimo que a candidata quebrou — impeditivo.');
  console.log('Uma linha "diverge do lido" é a auditoria por leitura tendo errado: o Emulator manda.');
  process.exit(0);
})();
