/* ============================================================================
   temvia — motor/comum.js
   Regras compartilhadas pelos quatro engines. Carregado pela casca ANTES do
   engine, para que gestor, cliente, motorista e passageiro usem exatamente a
   mesma implementacao.

   Regra numero um deste arquivo: nada aqui pode depender de tela, de Firebase
   ou de qual app esta rodando. So regra pura.
   ============================================================================ */
(function (raiz) {
  'use strict';

  // ==========================================================================
  // TELEFONE
  //
  // Formato canonico da temvia: DDD + numero, somente digitos.
  //     15996431008
  // A tela formata como quiser. Banco, comparacao, hash, login e validacao
  // trabalham SEMPRE sobre o canonico.
  // ==========================================================================

  // Sequencias que aparecem em cadastro como "sem telefone". Nunca sao validas.
  var PLACEHOLDERS = /^(\d)\1+$/;              // 00000000000, 11111111111...

  /**
   * Normaliza para o formato canonico.
   * Devolve { ok, valor, motivo }.
   *   ok=true  -> valor e o canonico (10 ou 11 digitos)
   *   ok=false -> motivo e uma frase pronta para a tela, em portugues
   *
   * Nao inventa DDD. Nao adivinha. Numero duvidoso e recusado, nao consertado.
   */
  function normalizarTelefone(bruto, opcoes) {
    var opt = opcoes || {};
    var obrigatorio = opt.obrigatorio !== false;

    if (bruto === null || bruto === undefined) bruto = '';
    var texto = String(bruto);

    var digitos = texto.replace(/\D/g, '');

    if (!digitos) {
      return obrigatorio
        ? { ok: false, valor: '', motivo: 'Informe o telefone.' }
        : { ok: true, valor: '', motivo: '' };
    }

    // Codigo do pais: so remove quando o que sobra fica com tamanho nacional
    // valido. Isso protege o DDD 55 (Santa Maria/RS), que tem 10 ou 11 digitos
    // e nao pode ser confundido com prefixo internacional.
    if (digitos.length === 12 || digitos.length === 13) {
      if (digitos.slice(0, 2) === '55') digitos = digitos.slice(2);
    }

    if (PLACEHOLDERS.test(digitos)) {
      return { ok: false, valor: '', motivo: 'Este numero nao e valido.' };
    }

    if (digitos.length < 10) {
      // 8 ou 9 digitos = numero sem DDD. Nao completamos: em Sorocaba o 15 e
      // obvio para quem esta ali, e errado para o proximo cliente da temvia.
      if (digitos.length === 8 || digitos.length === 9) {
        return { ok: false, valor: '', motivo: 'Informe o telefone com DDD.' };
      }
      return { ok: false, valor: '', motivo: 'Telefone incompleto.' };
    }

    if (digitos.length > 11) {
      return { ok: false, valor: '', motivo: 'Telefone com digitos demais.' };
    }

    var ddd = digitos.slice(0, 2);
    var numero = digitos.slice(2);

    // Nenhum DDD brasileiro comeca com 0 nem tem 0 na segunda casa.
    if (ddd[0] === '0' || ddd[1] === '0') {
      return { ok: false, valor: '', motivo: 'DDD invalido.' };
    }

    if (numero.length === 9 && numero[0] !== '9') {
      return { ok: false, valor: '', motivo: 'Celular deve comecar com 9 depois do DDD.' };
    }
    if (numero.length === 8 && '2345'.indexOf(numero[0]) === -1) {
      return { ok: false, valor: '', motivo: 'Numero fixo invalido.' };
    }

    return { ok: true, valor: ddd + numero, motivo: '' };
  }

  /** Só para exibir. Nunca usar o retorno para comparar, gravar ou hashear. */
  function formatarTelefone(canonico) {
    var d = String(canonico || '').replace(/\D/g, '');
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return String(canonico || '');
  }

  /** true quando os dois telefones sao a mesma linha, escritos como estiverem. */
  function mesmoTelefone(a, b) {
    var na = normalizarTelefone(a, { obrigatorio: false });
    var nb = normalizarTelefone(b, { obrigatorio: false });
    return na.ok && nb.ok && !!na.valor && na.valor === nb.valor;
  }

  /**
   * Chave do documento de login: sha256(canonico + sal da operacao).
   * O sal vem da casca; sem ele a mesma pessoa em duas operacoes teria a mesma
   * chave, e uma operacao poderia testar telefone da outra.
   */
  async function chaveLoginTelefone(bruto, sal) {
    var n = normalizarTelefone(bruto);
    if (!n.ok) throw new Error(n.motivo);
    var dados = new TextEncoder().encode(n.valor + '|' + String(sal || ''));
    var buf = await crypto.subtle.digest('SHA-256', dados);
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  /**
   * Confere um lote antes de virar identidade de login.
   * Duas pessoas com o mesmo telefone normalizado disputariam a MESMA chave
   * de login — a segunda sobrescreveria a primeira sem erro. Por isso isto
   * recusa em vez de escolher.
   *
   * registros: [{ id, nome, telefone }]
   * Devolve { validos, semTelefone, invalidos, duplicados, podeImportar }
   */
  function conferirLoteTelefones(registros) {
    var validos = [], semTelefone = [], invalidos = [];
    var porChave = {};

    (registros || []).forEach(function (r) {
      var n = normalizarTelefone(r.telefone, { obrigatorio: false });
      if (!n.ok) { invalidos.push({ registro: r, motivo: n.motivo }); return; }
      if (!n.valor) { semTelefone.push(r); return; }   // sem login ate ter numero
      if (!porChave[n.valor]) porChave[n.valor] = [];
      porChave[n.valor].push(r);
      validos.push({ registro: r, canonico: n.valor });
    });

    var duplicados = Object.keys(porChave)
      .filter(function (k) { return porChave[k].length > 1; })
      .map(function (k) { return { canonico: k, registros: porChave[k] }; });

    return {
      validos: validos.filter(function (v) { return porChave[v.canonico].length === 1; }),
      semTelefone: semTelefone,
      invalidos: invalidos,
      duplicados: duplicados,
      podeImportar: duplicados.length === 0 && invalidos.length === 0
    };
  }

  // ==========================================================================
  // APP CHECK
  //
  // O que ele faz: prova ao Firebase que a requisicao veio de uma pagina
  // servida num dominio registrado. E o que barra o `curl` e o script de
  // raspagem. NAO diz quem e o usuario — isso e a Fase 2.
  //
  // Mora aqui porque os quatro engines precisam do MESMO comportamento e
  // porque inicializar duas vezes a mesma instancia estoura. O controle de
  // "ja ativei nesta instancia" tem que ser unico.
  // ==========================================================================

  var _appCheckFeito = {};   // nome da instancia -> true
  var _appCheckLib = null;   // a biblioteca, carregada uma vez so

  /**
   * Liga o App Check numa instancia do Firebase.
   * Idempotente: chamar de novo na mesma instancia nao faz nada.
   * Nunca lanca — App Check quebrado nao pode derrubar o app antes do
   * enforcement estar ligado. Falha vira aviso no console.
   */
  async function ativarAppCheck(app, chaveSite) {
    if (!app || !chaveSite) return false;
    var nome = app.name || '[DEFAULT]';
    if (_appCheckFeito[nome]) return true;

    try {
      if (!_appCheckLib) {
        _appCheckLib = await import(
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js');
      }
      _appCheckLib.initializeAppCheck(app, {
        provider: new _appCheckLib.ReCaptchaV3Provider(chaveSite),
        isTokenAutoRefreshEnabled: true
      });
      _appCheckFeito[nome] = true;
      return true;
    } catch (e) {
      // Ja inicializado por outro caminho tambem cai aqui: marcar como feito
      // evita repetir a tentativa a cada chamada.
      _appCheckFeito[nome] = true;
      console.warn('[temvia] App Check nao ativou em "' + nome + '": ' + e.message);
      return false;
    }
  }

  // ==========================================================================
  // SESSAO ANONIMA
  //
  // Por que existe: as regras do Firestore passaram a exigir request.auth !=
  // null. A sessao anonima e o que satisfaz isso nos apps que nao tem login
  // proprio (motorista e passageiro). Sem ela, o Firestore recusa tudo — e no
  // caso do PIN o app interpreta a recusa como "ja existe um PIN cadastrado",
  // que e uma mentira dificil de diagnosticar.
  //
  // O QUE ELA NAO E: nao e autorizacao. Qualquer pessoa da internet obtem uma
  // em dois segundos. Quem barra o acesso indevido nesta fase e o App Check,
  // que exige que a requisicao venha de um dominio registrado. Autorizacao por
  // usuario e a Fase 2.
  //
  // CUIDADO QUE NAO PODE SE PERDER: no gestor e no cliente ja existe sessao de
  // verdade. Entrar como anonimo por cima DERRUBA o login. Por isso so
  // acontece quando nao ha usuario nenhum.
  // ==========================================================================

  var _anonFeito = {};

  async function garantirSessao(app) {
    if (!app) return false;
    var nome = app.name || '[DEFAULT]';
    if (_anonFeito[nome]) return true;

    try {
      var authLib = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      var auth = authLib.getAuth(app);

      // Espera o Firebase decidir se ja ha sessao guardada. Sem isso, um gestor
      // com login valido poderia levar um signInAnonymously por cima.
      await new Promise(function (resolve) {
        var pronto = authLib.onAuthStateChanged(auth, function () {
          pronto();
          resolve();
        });
      });

      if (!auth.currentUser) await authLib.signInAnonymously(auth);
      _anonFeito[nome] = true;
      return true;
    } catch (e) {
      _anonFeito[nome] = true;
      console.warn('[temvia] Sessao anonima nao obtida em "' + nome + '": ' + e.message +
                   ' — o Firestore vai recusar leitura e escrita.');
      return false;
    }
  }

  /** Ativa o App Check e garante sessao, na ordem certa, de uma vez. */
  async function prepararFirebase(app) {
    var ok = await ativarAppCheck(app, chaveAppCheck());
    await garantirSessao(app);
    return ok;
  }

  /** A chave vem da casca, como toda infraestrutura da plataforma. */
  function chaveAppCheck() {
    try {
      var k = window.CLIENTE_CONFIG && window.CLIENTE_CONFIG.appCheckKey;
      return (typeof k === 'string' && k.length > 20 && k.indexOf('COLE_') !== 0) ? k : '';
    } catch (e) { return ''; }
  }

  raiz.temviaComum = {
    ativarAppCheck: ativarAppCheck,
    garantirSessao: garantirSessao,
    prepararFirebase: prepararFirebase,
    chaveAppCheck: chaveAppCheck,
    normalizarTelefone: normalizarTelefone,
    formatarTelefone: formatarTelefone,
    mesmoTelefone: mesmoTelefone,
    conferirLoteTelefones: conferirLoteTelefones,
    chaveLoginTelefone: chaveLoginTelefone
  };

  // Para rodar a suite fora do navegador.
  if (typeof module !== 'undefined' && module.exports) module.exports = raiz.temviaComum;

})(typeof window !== 'undefined' ? window : globalThis);
