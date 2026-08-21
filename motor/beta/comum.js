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

  raiz.temviaComum = {
    normalizarTelefone: normalizarTelefone,
    formatarTelefone: formatarTelefone,
    mesmoTelefone: mesmoTelefone,
    conferirLoteTelefones: conferirLoteTelefones,
    chaveLoginTelefone: chaveLoginTelefone
  };

  // Para rodar a suite fora do navegador.
  if (typeof module !== 'undefined' && module.exports) module.exports = raiz.temviaComum;

})(typeof window !== 'undefined' ? window : globalThis);
