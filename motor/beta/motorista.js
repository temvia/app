/* ============================================================
   MOTOR REDENTOR — APP DO MOTORISTA
   Engine compartilhado multi-cliente. NAO edite as cascas dos
   clientes para mudar comportamento: toda melhoria vai AQUI e
   vale para todos os clientes em ate ~10 min (cache do Pages).
   A casca de cada cliente define window.CLIENTE_CONFIG.
   Versao: 1.0.0 ({data de geracao automatica})
   ============================================================ */
(function () {
  var C = window.CLIENTE_CONFIG;
  function bloqueio(titulo, msg) {
    document.body.innerHTML = '<div style="max-width:560px;margin:80px auto;padding:32px;font-family:sans-serif;background:#1a1208;border:2px solid #f59e0b;border-radius:14px;color:#fff;text-align:center"><div style="font-size:48px;margin-bottom:12px">\u26A0\uFE0F</div><h2 style="color:#f59e0b">' + titulo + '</h2><p>' + msg + '</p></div>';
  }
  if (!C || !C.fb || !C.clienteId) {
    bloqueio('Configura\u00e7\u00e3o ausente', 'Esta p\u00e1gina n\u00e3o definiu window.CLIENTE_CONFIG. Verifique a casca do cliente.');
    throw new Error('CLIENTE_CONFIG ausente');
  }
  // TRAVA DE PASTA: casca declara em qual caminho deve viver
  if (C.pathPrefix && location.protocol !== 'file:' && location.pathname.indexOf(C.pathPrefix) !== 0) {
    bloqueio('Arquivo no lugar errado', 'Esta casca \u00e9 do cliente <b>' + C.clienteId.toUpperCase() + '</b> e deveria estar em <b>' + C.pathPrefix + '</b>, mas foi aberta em <b>' + location.pathname + '</b>. Bloqueado por seguran\u00e7a.');
    throw new Error('pasta errada');
  }
  document.title = (C.empresaNome || C.marca) + ' \u2014 Portal temvia \u2014 Motorista';

  // Icones e manifest (PWA)
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="icon" type="image/png" sizes="32x32" href="/marca/favicon-32.png">' +
    '<link rel="icon" type="image/png" sizes="192x192" href="/marca/icon-192.png">' +
    '<link rel="icon" type="image/png" sizes="512x512" href="/marca/icon-512.png">' +
    '<link rel="apple-touch-icon" href="/marca/icon-192.png">');
  var manifestData = {
    name: C.marca + ' Motorista',
    short_name: C.marca,
    description: 'App de rota para motoristas da ' + C.marca,
    start_url: C.startUrl || location.pathname,
    display: 'standalone', background_color: '#0d1117', theme_color: '#f59e0b', orientation: 'portrait',
    icons: [
    { src: "/marca/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/marca/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
  };
  var mBlob = new Blob([JSON.stringify(manifestData)], {type: 'application/json'});
  var mLink = document.createElement('link'); mLink.rel = 'manifest'; mLink.href = URL.createObjectURL(mBlob);
  document.head.appendChild(mLink);

  // Estilos
  document.head.insertAdjacentHTML('beforeend', '<style>' + `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --bg: #0d1117;
  --surface: #161b22;
  --surface2: #1c2330;
  --border: #2d3748;
  --accent: #f59e0b;
  --accent2: #3b82f6;
  --green: #10b981;
  --red: #ef4444;
  --text: #e6edf3;
  --muted: #8b949e;
}

* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color: transparent; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* LOGIN */
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-logo {
  font-family: 'Barlow', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: var(--accent);
  margin-bottom: 4px;
  text-align: center;
}
.login-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 32px;
  text-align: center;
}
.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
}
.login-label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: block;
}
.login-input {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.login-input:focus { border-color: var(--accent); }
.login-btn {
  width: 100%;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  transition: opacity 0.15s;
}
.login-btn:active { opacity: 0.85; }
.login-error {
  color: var(--red);
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
  display: none;
}

/* MAIN APP */
.app { display: block; }
.app.open { display: block; }

.header {
  background: var(--surface);
  border-bottom: 2px solid var(--accent);
  padding: 14px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-logo {
  font-family: 'Barlow', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: var(--accent);
}
.header-sub { font-size: 11px; color: var(--muted); }
.logout-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

.body { padding: 16px; max-width: 480px; margin: 0 auto; }

.section-label {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
  display: block;
}

.select-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 13px 14px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.select-input:focus { border-color: var(--accent); }

/* START BUTTON */
.start-btn {
  display: flex;
  width: 100%;
  background: var(--green);
  color: #000;
  border: none;
  border-radius: 14px;
  padding: 18px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  text-decoration: none;
  transition: opacity 0.15s;
}
.start-btn:active { opacity: 0.85; }

/* Cards */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.card-title {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

/* Motorista card */
.moto-name {
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 18px;
}
.moto-tel { font-size: 13px; color: var(--accent2); margin-top: 4px; }

/* Stop list */
.stop {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}
.stop:last-child { border-bottom: none; }
.stop-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Barlow', sans-serif;
}
.stop-time {
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  min-width: 52px;
  line-height: 1;
  padding-top: 4px;
}
.stop-info { flex: 1; min-width: 0; }
.stop-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stop-addr {
  font-size: 12px;
  color: var(--muted);
  margin-top: 3px;
  line-height: 1.4;
}
.stop-tel { font-size: 12px; color: var(--accent2); margin-top: 3px; }
.nav-btn {
  display: block;
  background: var(--surface2);
  border: 1px solid var(--accent2);
  color: var(--accent2);
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  margin-top: 8px;
  font-family: 'DM Sans', sans-serif;
  text-decoration: none;
  transition: background 0.15s;
}
.nav-btn:active { background: rgba(59,130,246,0.15); }

/* Destination */
.dest-card {
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 12px;
}
.dest-time {
  font-family: 'Barlow', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: var(--accent2);
}
.dest-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
.dest-addr { font-size: 13px; color: var(--text); margin-top: 6px; }

/* Garagem card */
.garagem-card {
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

/* No data */
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: var(--muted);
}
.no-data-icon { font-size: 48px; margin-bottom: 12px; }
.no-data-title { font-family:'Barlow',sans-serif; font-weight:700; font-size:18px; color:var(--text); margin-bottom:8px; }

/* Summary chips */
.chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}
.chip-turno { border-color:var(--accent); color:var(--accent); background:rgba(245,158,11,0.08); }
.chip-pass { border-color:var(--green); color:var(--green); background:rgba(16,185,129,0.08); }
.chip-vei { border-color:var(--accent2); color:var(--accent2); background:rgba(59,130,246,0.08); }

  /* Navigation buttons */
  .nav-maps-btn {
    display: flex;
    background: var(--green);
    color: #000;
    border: none;
    border-radius: 12px;
    padding: 15px 10px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-decoration: none;
    transition: opacity 0.15s;
    width: 100%;
  }
  .nav-maps-btn:active { opacity: 0.8; }

  .stop-nav-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 8px;
  }
  .stop-nav-maps {
    display: block;
    background: var(--surface2);
    border: 1px solid var(--accent2);
    color: var(--accent2);
    border-radius: 8px;
    padding: 7px 8px;
    font-size: 11px;
    text-align: center;
    text-decoration: none;
    transition: background 0.15s;
  }
  .stop-nav-waze {
    display: block;
    background: var(--surface2);
    border: 1px solid #33CCFF;
    color: #33CCFF;
    border-radius: 8px;
    padding: 7px 8px;
    font-size: 11px;
    text-align: center;
    text-decoration: none;
    transition: background 0.15s;
  }
  .stop-nav-maps:active { background: rgba(59,130,246,0.15); }
  .stop-nav-waze:active { background: rgba(51,204,255,0.15); }


  /* Location toggle */
  .loc-toggle {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px; margin-bottom: 14px;
    cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .loc-toggle.active { border-color: var(--green); background: rgba(16,185,129,0.08); }
  .loc-toggle-icon { font-size: 22px; }
  .loc-toggle-text { flex: 1; }
  .loc-toggle-title { font-weight: 600; font-size: 14px; }
  .loc-toggle-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .loc-switch {
    width: 42px; height: 24px; background: var(--border);
    border-radius: 12px; position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .loc-toggle.active .loc-switch { background: var(--green); }
  .loc-switch::after {
    content: ''; position: absolute;
    width: 20px; height: 20px; background: #fff; border-radius: 50%;
    top: 2px; left: 2px; transition: left 0.2s;
  }
  .loc-toggle.active .loc-switch::after { left: 20px; }

  /* Sequential navigation mode */
  .seq-nav-card {
    background: var(--surface);
    border: 2px solid var(--accent);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    position: relative;
  }
  .seq-nav-label {
    font-size: 11px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .seq-nav-stop-num {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .seq-nav-name {
    font-family: 'Barlow', sans-serif;
    font-weight: 800;
    font-size: 22px;
    margin-bottom: 4px;
  }
  .seq-nav-time {
    font-size: 28px;
    font-weight: 800;
    color: var(--accent);
    font-family: 'Barlow', sans-serif;
    margin-bottom: 4px;
  }
  .seq-nav-addr {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 14px;
    line-height: 1.4;
  }
  .seq-nav-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  .btn-next-stop {
    width: 100%;
    background: var(--green);
    color: #000;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.15s;
  }
  .btn-next-stop:active { opacity: 0.8; }
  .seq-progress {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .seq-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .seq-dot.done { background: var(--green); }
  .seq-dot.current { background: var(--accent); transform: scale(1.3); }
  .seq-mode-toggle {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 14px;
    width: 100%;
  }
  .seq-stops-list {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .seq-stop-item {
    display: flex;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    transition: background 0.15s;
  }
  .seq-stop-item:last-child { border-bottom: none; }
  .seq-stop-item.done { opacity: 0.45; }
  .seq-stop-item.current { background: rgba(245,158,11,0.08); }
  .seq-stop-check {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
    cursor: pointer;
  }
  .seq-stop-item.done .seq-stop-check { background: var(--green); border-color: var(--green); color: #000; }
  .seq-stop-item.current .seq-stop-check { border-color: var(--accent); color: var(--accent); }

` + '</style>');
  document.head.insertAdjacentHTML('beforeend', '<style>' + `
/* Safe-area: evita que o cabecalho fique atras da barra de status do celular */
.header { padding-top: calc(14px + env(safe-area-inset-top)) !important; }
` + '</style>');

  // Estrutura da tela (marca do cliente injetada)
  try { vgTema(); vgFilaCarregar(); vgOcCarregar(); vgAvisosVistosCarregar(); } catch (e) {}
  try { vgIdentidade(); } catch (e) {}
  window.addEventListener('online', () => {
    VG_ONLINE = true; vgPintarSync(); vgFilaEnviar(); vgOcEnviar();
  });
  window.addEventListener('offline', () => { VG_ONLINE = false; vgPintarSync(); });
  document.body.innerHTML = `

<!-- LOGIN SCREEN -->
<!-- PWA Manifest inline -->


<!-- Splash Screen -->
<div id="splashScreen" style="
  position: fixed; inset: 0; z-index: 9999;
  background: #0d1117;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  transition: opacity 0.5s ease;
">
  <img src="data:image/png;base64,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" style="width:120px;height:120px;border-radius:24px;margin-bottom:20px;box-shadow:0 8px 32px rgba(245,158,11,0.3)">
  <div style="font-family:Barlow,sans-serif;font-weight:800;font-size:28px;color:#f59e0b;letter-spacing:1px">__MARCA_UPPER__</div>
  <div style="font-family:DM Sans,sans-serif;font-size:13px;color:#8b949e;margin-top:4px">Fretamento — Área do Motorista</div>
  <div style="margin-top:40px;display:flex;gap:6px">
    <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;animation:pulse 1.2s ease-in-out infinite"></div>
    <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;animation:pulse 1.2s ease-in-out 0.2s infinite"></div>
    <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;animation:pulse 1.2s ease-in-out 0.4s infinite"></div>
  </div>
</div>
<style>
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>

<!-- Install PWA Banner (shown once) -->
<div id="installBanner" style="
  display:none; position:fixed; bottom:0; left:0; right:0; z-index:500;
  background:var(--surface); border-top:1px solid var(--accent);
  padding:12px 16px; align-items:center; gap:12px;
">
  <img src="data:image/png;base64,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" style="width:40px;height:40px;border-radius:10px">
  <div style="flex:1">
    <div style="font-weight:700;font-size:13px">Adicionar à tela inicial</div>
    <div style="font-size:11px;color:var(--muted)">Acesse como um app sem o navegador</div>
  </div>
  <div id="installBtnArea"></div>
  <button onclick="document.getElementById('installBanner').style.display='none'" style="background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;padding:4px">×</button>
</div>

<div class="app" id="appMain" style="display:flex;flex-direction:column;min-height:100vh;padding-bottom:74px">
  <div class="header">
    <div>
      <div class="header-logo"><img src="/marca/temvia-simbolo.png" alt="" width="20" height="20" style="vertical-align:-4px;margin-right:7px">temvia</div>
      <div class="header-amb" id="headerAmb" style="display:none">(AMBIENTE DE TESTE)</div>
      <div class="header-sub" id="headerSub">Rota do Dia</div>
    </div>
    <div style="display:flex;gap:8px"><button class="logout-btn" id="btnAtualizarApp" onclick="atualizarApp()" title="Buscar as atualizações mais recentes">Atualizar</button></div>
  </div>

  <div class="vg-barra vg-barra-so-mais" id="vgBarra"></div>

  <div class="body">
    <!-- ABAS -->
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button id="abaRotaBtn" onclick="trocarAba('rota')"
        style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--accent);background:var(--accent);color:#000;font-family:'Barlow',sans-serif;font-weight:800;font-size:12px;cursor:pointer">
        Minha Rota
      </button>
      <button id="abaHojeBtn" onclick="trocarAba('hoje')"
        style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--border);background:transparent;color:var(--muted);font-family:'Barlow',sans-serif;font-weight:800;font-size:12px;cursor:pointer;position:relative">
        Rotas de Hoje<span id="hojeBadge" style="display:none;position:absolute;top:-6px;right:-6px;background:var(--red);color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:800;align-items:center;justify-content:center">0</span>
      </button>
      <button id="abaBuscaBtn" onclick="trocarAba('busca')"
        style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--border);background:transparent;color:var(--muted);font-family:'Barlow',sans-serif;font-weight:800;font-size:12px;cursor:pointer">
        Busca
      </button>
    </div>

    <!-- ABA ROTAS DE HOJE -->
    <div id="abaHoje" style="display:none">
      <div style="margin-bottom:8px">
        <label class="section-label">Selecione seu nome</label>
        <select class="select-input" id="selMotoristaHoje" onchange="carregarRotasHoje()">
          <option value="">— Selecione o motorista —</option>
        </select>
      </div>
      <div style="margin-bottom:8px">
        <label class="section-label">Cobertura — ver rotas de outro motorista</label>
        <select class="select-input" id="selCobertura" onchange="carregarRotasHoje()">
          <option value="">— ninguém (só as minhas) —</option>
        </select>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Para quando um colega falta ou atrasa: veja e rode a rota dele sem precisar do PIN dele.</div>
      </div>
      <div id="rotasHojeLista"></div>
    </div>

    <!-- ABA MINHA ROTA -->
    <div id="abaRota">
      <!-- Cabecalho: quem sou e qual linha. Recolhe assim que a rota
           esta escolhida — em movimento isso vira ruido. -->
      <div class="vg-cab" id="vgCab" style="display:none">
        <span class="vg-quem" id="vgQuem"><span id="vgQuemNome"></span></span>
        <span id="vgSync" class="vg-sync"></span>
      </div>

      <div id="vgSeletores" class="vg-seletores">
        <label class="section-label">Selecione seu nome</label>
        <select class="select-input" id="selMotorista" onchange="loadLinhas()">
          <option value="">— Selecione o motorista —</option>
        </select>
        <label class="section-label" style="margin-top:10px">Cobertura — rodar a rota de um colega</label>
        <select class="select-input" id="selCoberturaRota" onchange="loadLinhas()">
          <option value="">— ninguém (só as minhas) —</option>
        </select>
        <div class="vg-dica">Para quando um colega falta ou atrasa: veja e rode a rota dele
          sem precisar do PIN dele.</div>
        <div id="coberturaAvisoRota"></div>
        <div id="linhaSection" style="display:none;margin-top:10px">
          <label class="section-label">Linha e turno</label>
          <select class="select-input" id="selLinha" onchange="loadRota()">
            <option value="">— Selecione uma linha —</option>
          </select>
        </div>
      </div>

      <div id="vgTela"></div>
      <!-- barra fixa: fica fora das abas para nao sumir na Busca -->
      <!-- A tela antiga da rota so aparece quando nao ha viagem montada. -->
      <div id="rotaContent"></div>
    </div>

    <!-- ABA BUSCA RÁPIDA -->
    <div id="abaBusca" style="display:none">
      <input id="buscaRapidaInput" type="text" placeholder="Digite nome, bairro ou cidade..."
        oninput="renderBuscaRapida()"
        style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;margin-bottom:12px;box-sizing:border-box">

      <!-- Resultado de busca individual -->
      <div id="buscaRapidaResultados"></div>

      <!-- Selecionados para rota personalizada -->
      <div id="buscaRapidaSelecionadosBox" style="display:none;margin-top:16px;background:var(--surface);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:14px">
        <div style="font-family:'Barlow',sans-serif;font-weight:700;font-size:13px;color:var(--accent);margin-bottom:6px">
          Rota personalizada — <span id="buscaRapidaCount">0</span> parada(s)
        </div>
        <div style="background:rgba(245,158,11,0.08);border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--muted);line-height:1.6">
          Navegue <strong style="color:var(--text)">ponto a ponto</strong> — clique em Maps ou Waze em cada parada, conclua a navegação e volte para a próxima.
        </div>
        <div id="buscaRapidaSelecionadosList" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
        <div id="buscaRapidaPorParada"></div>
        <button onclick="limparBuscaSelecionados()"
          style="width:100%;margin-top:12px;padding:8px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:12px;cursor:pointer">
          ✕ Limpar seleção
        </button>
      </div>
    </div>
  </div>
</div>

`.split('__MARCA_UPPER__').join(C.marcaUpper || C.marca.toUpperCase());
})();

// ================= CODIGO DO APP (escopo global) =================

// Helper: escapar caracteres especiais para injeção segura em HTML
function esc(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== DATA LOCAL (fuso Brasilia UTC-3) =====
// Corrige o bug de toISOString() devolver UTC (que vira o dia seguinte apos 21h).
function hojeLocal(baseDate, offsetDias){
  var d = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date();
  if (offsetDias) d.setTime(d.getTime() + offsetDias*86400000);
  // desloca para -03:00 e formata em UTC para extrair a data local de Brasilia
  var br = new Date(d.getTime() - 3*3600000);
  return br.toISOString().slice(0,10);
}

function _rotaDataLonga(data) {
  // "\uD83D\uDCC5 12/07 (Dom) \u00b7 " para o motorista ver a data exata da rota
  if (!data) return '';
  const p = data.split('-');
  if (p.length !== 3) return '';
  const d = new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','S\u00e1b'];
  return '\uD83D\uDCC5 ' + p[2] + '/' + p[1] + ' (' + dias[d.getDay()] + ') \u00b7 ';
}

function _rotaSelo(data) {
  // Selo da rota: HOJE, AMANHA, ou a data real (DD/MM). Datas passadas mostram ATRASADA.
  if (!data) return '';
  const hoje = hojeLocal();
  const amanha = hojeLocal(new Date(), 1);
  if (data === hoje) return 'HOJE';
  if (data === amanha) return 'AMANH\u00c3';
  const p = data.split('-');
  if (p.length !== 3) return data;
  const txt = p[2] + '/' + p[1];
  return (data < hoje) ? (txt + ' · ATRASADA') : txt;
}

function mesLocal(baseDate){
  var d = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date();
  var br = new Date(d.getTime() - 3*3600000);
  return br.toISOString().slice(0,7);
}

function _diaChat(m){ try{ var d = m && m.em ? new Date(m.em) : null; if(!d || isNaN(d)) return ''; return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }catch(e){ return ''; } }
function _fmtDiaChat(m){ try{ var d = new Date(m.em); var hoje=new Date(); var ymd=function(x){return x.getFullYear()+'-'+x.getMonth()+'-'+x.getDate();}; var ont=new Date(hoje); ont.setDate(hoje.getDate()-1); if(ymd(d)===ymd(hoje)) return 'Hoje'; if(ymd(d)===ymd(ont)) return 'Ontem'; return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); }catch(e){ return ''; } }
function _sepDataChat(m, anterior){ var dAtual=_diaChat(m); if(!dAtual) return ''; var dAnt = anterior ? _diaChat(anterior) : ''; if(dAtual===dAnt) return ''; var lbl=_fmtDiaChat(m); if(!lbl) return ''; return '<div style="align-self:center;margin:8px auto;padding:3px 12px;background:rgba(128,128,128,0.18);border-radius:12px;font-size:11px;font-weight:600;color:var(--muted);text-align:center">'+lbl+'</div>'; }

// ---- ABAS ----
const BUSCA_KEY = (window.CLIENTE_CONFIG && window.CLIENTE_CONFIG.storageKey
                   && window.CLIENTE_CONFIG.storageKey !== 'evamo_v1')
  ? window.CLIENTE_CONFIG.storageKey + '_busca_sessao'
  : 'evamo_busca_sessao';

function salvarBuscaSessao() {
  try {
    localStorage.setItem(BUSCA_KEY, JSON.stringify({
      aba: document.getElementById('abaBusca').style.display !== 'none' ? 'busca' : 'rota',
      query: document.getElementById('buscaRapidaInput') ? document.getElementById('buscaRapidaInput').value : '',
      selecionados: buscaSelecionados
    }));
  } catch(e) {}
}

function restaurarBuscaSessao() {
  try {
    const raw = localStorage.getItem(BUSCA_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.aba === 'busca') {
      trocarAba('busca');
      if (s.query) {
        document.getElementById('buscaRapidaInput').value = s.query;
        renderBuscaRapida();
      }
      if (s.selecionados && s.selecionados.length > 0) {
        buscaSelecionados = s.selecionados;
        atualizarRotaPersonalizada();
      }
    }
  } catch(e) {}
}
function trocarAba(aba) {
  document.getElementById('abaRota').style.display  = aba === 'rota' ? 'block' : 'none';
  document.getElementById('abaHoje').style.display  = aba === 'hoje' ? 'block' : 'none';
  document.getElementById('abaBusca').style.display = aba === 'busca' ? 'block' : 'none';
  const btns = { rota: 'abaRotaBtn', hoje: 'abaHojeBtn', busca: 'abaBuscaBtn' };
  Object.entries(btns).forEach(([k, id]) => {
    const b = document.getElementById(id);
    const on = k === aba;
    b.style.background  = on ? 'var(--accent)' : 'transparent';
    b.style.color       = on ? '#000' : 'var(--muted)';
    b.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
  });
  if (aba === 'busca') setTimeout(() => document.getElementById('buscaRapidaInput').focus(), 100);
  if (aba === 'hoje') popularMotoristasHoje();
  salvarBuscaSessao();
}

// ---- ROTAS DE HOJE (publicadas pelo gestor via roteirizador) ----
let ROTAS_HOJE = [];

async function carregarRotasHojeFirebase() {
  try {
    const { getFirestore, getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    if (!verificarIdentidade()) return;
    const fbDb = getFirestore(await fbAppMotorista());
    const snap = await getDoc(doc(fbDb, CLIENTE_ID, 'rotas_do_dia'));
    ROTAS_HOJE = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
  } catch(e) {
    console.warn('Rotas de hoje indisponíveis:', e);
    ROTAS_HOJE = [];
  }
  // Opcao B: mostra enquanto NAO estiver concluida pelo motorista (independe da data)
  ROTAS_HOJE = ROTAS_HOJE.filter(r => !r.concluida);
  atualizarBadgeHoje();
}

// Motorista conclui uma rota publicada: marca concluida=true no Firebase.
// Some da lista do motorista; o gestor continua vendo (como "concluída") e pode excluir depois.
async function concluirRotaHoje(rotaId) {
  const status = document.getElementById('concluirStatus-' + rotaId);
  if (!confirm('Confirmar conclusão desta rota? Ela sairá da sua lista.')) return;
  if (status) status.textContent = '⏳ Concluindo...';
  try {
    const { getFirestore, getDoc, setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    if (!verificarIdentidade()) return;
    const fbDb = getFirestore(await fbAppMotorista());
    const ref = doc(fbDb, CLIENTE_ID, 'rotas_do_dia');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const nome = document.getElementById('selMotoristaHoje') ? document.getElementById('selMotoristaHoje').value : '';
    let achou = false;
    lista = lista.map(r => {
      if (r.id === rotaId) { achou = true; return { ...r, concluida: true, concluidaEm: new Date().toISOString(), concluidaPor: nome || (r.motorista||'') }; }
      return r;
    });
    if (!achou) { if (status) status.textContent = 'Rota não encontrada.'; return; }
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    // Atualiza a lista local e a tela do motorista
    await carregarRotasHojeFirebase();
    carregarRotasHoje();
  } catch(e) {
    if (status) status.textContent = 'Erro ao concluir: ' + e.message;
  }
}

function atualizarBadgeHoje() {
  const badge = document.getElementById('hojeBadge');
  if (!badge) return;
  const n = ROTAS_HOJE.length;
  if (n > 0) { badge.textContent = n; badge.style.display = 'flex'; }
  else badge.style.display = 'none';
}

function popularMotoristasHoje() {
  const sel = document.getElementById('selMotoristaHoje');
  const atual = sel.value;
  sel.innerHTML = '<option value="">— Selecione o motorista —</option>';
  // Nomes de motoristas que têm rota hoje
  const comRota = [...new Set(ROTAS_HOJE.map(r => r.motorista))];
  const todos = MOTORISTAS.map(m => m.nome);
  const comIdentidade = new Set(MOTORISTAS.filter(temIdentidade).map(m => m.nome));
  const ordenados = [...new Set([...comRota, ...todos])].filter(n => comIdentidade.has(n));
  ordenados.forEach(nome => {
    const temRota = comRota.includes(nome);
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome + (temRota ? ' ●' : '');
    sel.appendChild(opt);
  });
  if (atual) { sel.value = atual; }
  // Popular o seletor de cobertura com todos os motoristas
  const selC = document.getElementById('selCobertura');
  if (selC) {
    const atualC = selC.value;
    selC.innerHTML = '<option value="">— ninguém (só as minhas) —</option>';
    ordenados.forEach(nome => {
      const temRota = comRota.includes(nome);
      const o = document.createElement('option');
      o.value = nome; o.textContent = nome + (temRota ? ' ●' : '');
      selC.appendChild(o);
    });
    if (atualC) selC.value = atualC;
  }
  if (atual) carregarRotasHoje();
}

async function carregarRotasHoje() {
  const nome = document.getElementById('selMotoristaHoje').value;
  if (nome && !(await commVerificarPin(nome))) { const _s=document.getElementById('selMotoristaHoje'); if(_s)_s.value=''; return; }
  const div = document.getElementById('rotasHojeLista');
  if (!nome) { div.innerHTML = ''; return; }
  // Cobertura: ver as rotas de um colega (sem o PIN dele; a identidade continua sendo a sua)
  const cobertura = (document.getElementById('selCobertura') || {}).value || '';
  const nomeVer = cobertura || nome;
  const minhas = ROTAS_HOJE.filter(r => r.motorista === nomeVer)
    .sort((a,b) => (a.departure||'').localeCompare(b.departure||''));
  let aviso = '';
  if (cobertura && cobertura !== nome) {
    aviso = '<div style="background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.4);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px">'+
      '\uD83D\uDD01 <strong>Modo cobertura:</strong> voc\u00ea (' + esc(nome) + ') est\u00e1 vendo as rotas de <strong>' + esc(cobertura) + '</strong>.</div>';
  }
  if (!minhas.length) {
    div.innerHTML = aviso + '<div style="padding:30px 16px;text-align:center;color:var(--muted)">'+
      '<div style="font-size:32px;margin-bottom:8px"></div>'+
      'Nenhuma rota publicada para <strong>' + esc(nomeVer) + '</strong> hoje.<br>'+
      '<span style="font-size:12px">Use a aba <strong>Minha Rota</strong> para ver as linhas fixas.</span></div>';
    return;
  }
  div.innerHTML = aviso + minhas.map(r => {
    const isSaida = r.modo === 'saida';
    const dataFmt = _rotaSelo(r.data);
    let h = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:14px">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    h += '<span style="background:' + (isSaida?'var(--red)':'var(--green)') + ';color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">' + (isSaida?'SAÍDA':'ENTRADA') + '</span>';
    h += '<span style="background:var(--accent);color:#000;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">' + dataFmt + '</span>';
    h += '</div>';
    h += '<div style="font-family:\'Barlow\',sans-serif;font-weight:800;font-size:17px;margin-bottom:2px">' + esc(r.nomeRota) + '</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">' + _rotaDataLonga(r.data) + esc(r.veiculoNome) + ' · ' + r.totalMin + ' min · ' + r.totalKm + ' km · ' + r.paradas.length + ' paradas</div>';

    // Origem
    h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border)">';
    h += '<div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px"></div>';
    h += '<div><div style="font-size:11px;color:var(--muted)">' + (isSaida?'Saída da empresa às':'Saída da garagem às') + '</div>';
    h += '<div style="font-weight:700">' + r.departure + '</div></div></div>';

    // Paradas
    r.paradas.forEach(p => {
      const telLimpo = (p.telefone || '').replace(/\D/g,'');
      h += '<div style="padding:10px 0;border-top:1px solid var(--border)">';
      h += '<div style="display:flex;align-items:flex-start;gap:10px">';
      h += '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0">' + p.ordem + '</div>';
      h += '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:14px">' + esc(p.nome) + '</div>';
      h += '<div style="font-size:12px;color:var(--muted)">' + esc(p.embarque) + (p.bairro?' · '+esc(p.bairro):'') + '</div></div>';
      h += '<div style="font-weight:800;color:var(--accent);font-size:16px;flex-shrink:0">' + p.horario + '</div>';
      h += '</div>';
      // Linha de ações: WhatsApp + Ir
      h += '<div style="display:flex;gap:8px;margin-top:8px;margin-left:38px">';
      if (telLimpo) {
        h += '<a href="https://wa.me/55' + telLimpo + '" target="_blank" style="flex:1;text-align:center;background:rgba(37,211,102,0.12);color:#25D366;border:1px solid rgba(37,211,102,0.3);border-radius:8px;padding:8px;font-size:13px;font-weight:700;text-decoration:none">' + esc(p.telefone) + '</a>';
      }
      const q = p.lat && p.lng ? p.lat+','+p.lng : encodeURIComponent(p.embarque+' '+(p.cidade||'Sorocaba'));
      h += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + q + '&travelmode=driving" target="_blank" style="flex:1;text-align:center;background:rgba(59,130,246,0.12);color:var(--accent2);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:8px;font-size:13px;font-weight:700;text-decoration:none">Navegar</a>';
      h += '</div>';
      h += '</div>';
    });

    // Para ENTRADA: mostra chegada na empresa. Para SAÍDA: não mostra retorno.
    if (!isSaida) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border)">';
      h += '<div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px"></div>';
      h += '<div><div style="font-size:11px;color:var(--muted)">Chegada na empresa</div>';
      h += '<div style="font-weight:700">' + r.horarioReferencia + '</div></div></div>';
    }

    // Mensagem de atenção
    h += '<div style="margin-top:12px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--text);line-height:1.5">';
    h += '<strong>Atenção, motorista:</strong> programe-se com antecedência, verifique o veículo antes de sair (combustível, pneus, limpeza), confirme presença dos passageiros e dirija com segurança. Bom trabalho! ';
    h += '</div>';

    // Botões de comunicação da rota extra (chat + localização)
    h += '<div style="display:flex;gap:8px;margin-top:10px">';
    h += '<button onclick="commExtraLocal(\'' + r.id + '\')" style="flex:1;background:var(--accent2);color:#fff;border:none;border-radius:10px;padding:11px;font-weight:700;font-family:Barlow;font-size:13px;cursor:pointer">Localização</button>';
    h += '<button onclick="commExtraChat(\'' + r.id + '\',\'' + esc(r.nomeRota).replace(/'/g,"") + '\')" style="flex:1;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:11px;font-weight:700;font-family:Barlow;font-size:13px;cursor:pointer">Chat da rota</button>';
    h += '</div>';
    h += '<button onclick="concluirRotaHoje(\'' + r.id + '\')" style="width:100%;margin-top:8px;background:rgba(16,185,129,0.12);color:var(--green);border:1px solid rgba(16,185,129,0.4);border-radius:10px;padding:12px;font-weight:800;font-family:Barlow;font-size:14px;cursor:pointer">Concluir rota</button>';
    h += '<div id="concluirStatus-' + r.id + '" style="font-size:12px;color:var(--muted);text-align:center;margin-top:6px"></div>';
    h += '<div id="commExtraBox-' + r.id + '" style="display:none;margin-top:10px"></div>';

    h += '</div>';
    return h;
  }).join('');
}

// ---- BUSCA RÁPIDA ----
let buscaSelecionados = [];

function getAllPassageiros() {
  const todos = [];
  DATA.forEach(rota => {
    rota.passageiros.filter(p => p.status === 'ativo').forEach(p => {
      todos.push({ ...p, linhaInfo: 'Linha ' + rota.linha + ' · ' + rota.turno + ' Turno' });
    });
  });
  return todos;
}

function renderBuscaRapida() {
  const q = document.getElementById('buscaRapidaInput').value.toLowerCase().trim();
  const div = document.getElementById('buscaRapidaResultados');
  if (!q) { div.innerHTML = ''; return; }

  const found = getAllPassageiros().filter(p =>
    [p.nome, p.bairro, p.cidade, p.embarque, p.endereco]
      .map(x => (x||'').toLowerCase()).join(' ').includes(q)
  );

  if (found.length === 0) {
    div.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:13px;text-align:center">Nenhum resultado.</div>';
    return;
  }

  window._buscaResultados = found.slice(0, 20);
  div.innerHTML = '';

  window._buscaResultados.forEach(function(p, idx) {
    const jaSel = buscaSelecionados.some(function(s) { return s.nome === p.nome && s.embarque === p.embarque; });
    const addr = p.embarque || p.endereco || '';
    const mapsUrl = p.lat && p.lng
      ? 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng + '&travelmode=driving'
      : 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr + ', ' + (p.cidade||'Sorocaba') + ' SP') + '&travelmode=driving';
    const wazeUrl = buildWazeUrl(p.lat, p.lng, addr, p.cidade);

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface);border:2px solid ' + (jaSel ? 'var(--accent)' : 'var(--border)') + ';border-radius:12px;padding:14px;margin-bottom:8px';

    // Botão + usando addEventListener (sem inline onclick, sem problemas com aspas)
    const btnSel = document.createElement('button');
    btnSel.style.cssText = 'flex-shrink:0;width:36px;height:36px;border-radius:50%;border:2px solid ' + (jaSel ? 'var(--accent)' : 'var(--border)') + ';background:' + (jaSel ? 'rgba(245,158,11,0.15)' : 'transparent') + ';color:' + (jaSel ? 'var(--accent)' : 'var(--muted)') + ';font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1';
    btnSel.textContent = jaSel ? '' : '＋';
    btnSel.addEventListener('click', function() {
      toggleBuscaSelecionado(idx, btnSel, card);
    });

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML =
      '<div style="font-weight:700;font-size:14px">' + esc(p.nome) + '</div>' +
      '<div style="font-size:12px;color:var(--muted)">' + esc(p.linhaInfo) + '</div>' +
      (addr ? '<div style="font-size:12px;color:var(--muted)">' + esc(addr) + (p.cidade ? ' · ' + esc(p.cidade) : '') + '</div>' : '');

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px';
    topRow.appendChild(infoDiv);
    topRow.appendChild(btnSel);

    const navRow = document.createElement('div');
    navRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px';
    navRow.innerHTML =
      '<a href="' + mapsUrl + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:8px;background:var(--green);color:#000;font-family:Barlow,sans-serif;font-weight:800;font-size:13px;text-decoration:none">Google Maps</a>' +
      '<a href="' + wazeUrl + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:8px;background:#33CCFF;color:#000;font-family:Barlow,sans-serif;font-weight:800;font-size:13px;text-decoration:none">Waze</a>';

    card.appendChild(topRow);
    card.appendChild(navRow);
    div.appendChild(card);
  });
}

function toggleBuscaSelecionado(idx, btn, card) {
  const p = window._buscaResultados[idx];
  if (!p) return;
  const pos = buscaSelecionados.findIndex(function(s) { return s.nome === p.nome && s.embarque === p.embarque; });
  if (pos >= 0) {
    buscaSelecionados.splice(pos, 1);
    btn.textContent = '＋';
    btn.style.borderColor = 'var(--border)';
    btn.style.background = 'transparent';
    btn.style.color = 'var(--muted)';
    if (card) card.style.borderColor = 'var(--border)';
  } else {
    buscaSelecionados.push(p);
    btn.textContent = '';
    btn.style.borderColor = 'var(--accent)';
    btn.style.background = 'rgba(245,158,11,0.15)';
    btn.style.color = 'var(--accent)';
    if (card) card.style.borderColor = 'var(--accent)';
  }
  atualizarRotaPersonalizada();
  salvarBuscaSessao();
}

function atualizarRotaPersonalizada() {
  const box   = document.getElementById('buscaRapidaSelecionadosBox');
  const lista = document.getElementById('buscaRapidaSelecionadosList');
  const count = document.getElementById('buscaRapidaCount');
  if (buscaSelecionados.length === 0) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  count.textContent = buscaSelecionados.length;

  // Chips com nome e botão remover
  lista.innerHTML = buscaSelecionados.map(function(p, i) {
    return '<div style="display:flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:4px 10px;font-size:12px">' +
      '<span style="background:var(--accent);color:#000;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0">' + (i+1) + '</span>' +
      '<span style="flex:1">' + p.nome.split(' ').slice(0,2).join(' ') + '</span>' +
      '<button onclick="removerBuscaSelecionado(' + i + ')" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:0 2px;font-size:16px">×</button>' +
      '</div>';
  }).join('');

  // Lista parada a parada com Maps e Waze individuais
  const porParada = document.getElementById('buscaRapidaPorParada');
  if (porParada) {
    porParada.innerHTML = '';
    buscaSelecionados.forEach(function(p, i) {
      const addr = p.embarque || p.endereco || '';
      const mapsUrl = p.lat && p.lng
        ? 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng + '&travelmode=driving'
        : 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr + ', ' + (p.cidade||'Sorocaba') + ' SP') + '&travelmode=driving';
      const wazeUrl = buildWazeUrl(p.lat, p.lng, addr, p.cidade);
      const item = document.createElement('div');
      item.style.cssText = 'margin-bottom:8px;padding:10px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:10px';
      item.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
          '<span style="background:var(--accent);color:#000;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0">' + (i+1) + '</span>' +
          '<div style="flex:1">' +
            '<div style="font-weight:700;font-size:13px">' + esc(p.nome.split(' ').slice(0,2).join(' ')) + '</div>' +
            (addr ? '<div style="font-size:11px;color:var(--muted)">' + esc(addr) + '</div>' : '') +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' +
              (p.linhaInfo ? '<span style="font-size:10px;background:rgba(245,158,11,0.12);color:var(--accent);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:2px 7px">' + esc(p.linhaInfo) + '</span>' : '') +
              (p.bairro ? '<span style="font-size:10px;background:var(--surface2);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:2px 7px">' + esc(p.bairro) + '</span>' : '') +
            '</div>' +
            (p.telefone ? '<a href="https://wa.me/55' + p.telefone.replace(/\D/g,'') + '" target="_blank" style="display:inline-flex;align-items:center;gap:5px;margin-top:6px;font-size:11px;color:#25D366;text-decoration:none;font-weight:600">' + esc(p.telefone) + '</a>' : '') +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
          '<a href="' + mapsUrl + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:8px;background:var(--green);color:#000;font-family:Barlow,sans-serif;font-weight:800;font-size:12px;text-decoration:none">Maps</a>' +
          '<a href="' + wazeUrl + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:8px;background:#33CCFF;color:#000;font-family:Barlow,sans-serif;font-weight:800;font-size:12px;text-decoration:none">Waze</a>' +
        '</div>';
      porParada.appendChild(item);
    });
  }
}

function removerBuscaSelecionado(idx) {
  buscaSelecionados.splice(idx, 1);
  atualizarRotaPersonalizada();
  renderBuscaRapida();
  salvarBuscaSessao();
}

function limparBuscaSelecionados() {
  buscaSelecionados = [];
  atualizarRotaPersonalizada();
  renderBuscaRapida();
  try { localStorage.removeItem(BUSCA_KEY); } catch(e) {}
}

// ---- CONFIG ----
const SENHA = 'redentor2025'; // Altere aqui para mudar a senha
// Chaves de cache local. Vem da casca para que o ambiente de teste nao
// compartilhe cache nem sessao com a producao. A reserva mantem o valor
// historico, para nao invalidar o cache de quem ja usa o app.
const _BASE_LOCAL = (window.CLIENTE_CONFIG && window.CLIENTE_CONFIG.storageKey)
  || 'evamo_v1';
const STORAGE_KEY = _BASE_LOCAL;
const CHEGADAS = { '1°': '05:45', '2°': '14:45', '3°': '20:55' };
const GARAGEM = 'R. Sebastiana Rosa Luposeli, 59 — Júlio de Mesquita Filho, Sorocaba-SP';
const GARAGEM_COORDS = window.CLIENTE_CONFIG.garagem;
const EMPRESA_COORDS = window.CLIENTE_CONFIG.destino;
// Fallback inicial; os valores reais vêm dos Dados da Empresa (config no Firebase),
// carregados por commCarregarTurnos() ao iniciar a rota.
let TURNOS_CHEGADA = { '1°': '05:45', '2°': '14:45', '3°': '20:55', 'ADM': '07:15' };



const VG_SENTIDOS = ['ida', 'volta'];
const VG_ESTADOS = ['programada', 'em_curso', 'encerrada'];

// Eventos da VIAGEM (nao de uma pessoa)
const VG_EV_VIAGEM = ['partida', 'chegada', 'desembarque_coletivo', 'fim'];
// Eventos do VIAJANTE
const VG_EV_PESSOA = ['embarque', 'desembarque', 'ausencia'];

// Tipos fechados, nao texto livre: o gestor precisa CONTAR quantas vezes
// o transito atrasou a linha, e isso nao sai de campo aberto.
const VG_TIPOS_OCORRENCIA = [
  { id: 'transito',  rotulo: 'Tr\u00e2nsito / via bloqueada' },
  { id: 'veiculo',   rotulo: 'Problema no ve\u00edculo' },
  { id: 'acesso',    rotulo: 'Acesso ao ponto ou \u00e0 portaria' },
  { id: 'passageiro',rotulo: 'Passageiro' },
  { id: 'atraso',    rotulo: 'Atraso' },
  { id: 'outro',     rotulo: 'Outro' }
];

const VG_MOTIVOS_AUSENCIA = [
  { id: 'nao_estava', rotulo: 'Não estava no ponto' },
  { id: 'avisou', rotulo: 'Avisou que não iria' },
  { id: 'outro_ponto', rotulo: 'Embarcou em outro ponto' },
  { id: 'outro', rotulo: 'Outro motivo' }
];

function vgId() {
  return 'vg' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Uma viagem nasce PROGRAMADA, a partir da linha e do dia. Chegada e
// partida programadas vem do calendario do turno — nao de um horario fixo.
function vgCriar(rota, dataIso, sentido) {
  const t = (typeof tvTurnoNoDia === 'function') ? tvTurnoNoDia(rota.turno, dataIso) : null;
  if (t && !t.opera) return null;             // linha nao roda nesse dia
  const chegada = (t && t.chegada) || (TURNOS_CHEGADA || {})[rota.turno] || '';
  const saida = (t && t.saida) || '';
  const c = rota.calc || {};
  return {
    id: vgId(), rotaId: rota.id, linha: rota.linha, turno: rota.turno,
    data: dataIso, sentido: sentido === 'volta' ? 'volta' : 'ida',
    estado: 'programada',
    motorista: rota.motorista || '', veiculo: rota.veiculo || '',
    // programados
    inicioProgramado: (sentido === 'volta') ? saida : (c.departure || ''),
    chegadaProgramada: (sentido === 'volta') ? '' : chegada,
    // reais: preenchidos pelo motorista
    inicioReal: '', chegadaReal: '', fimReal: '',
    eventos: []
  };
}

function vgAgora() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

// Registra um evento. 'previsto' vem do plano; 'real' do relogio.
// O atraso NAO e gravado: e calculado quando alguem perguntar.
function vgRegistrar(viagem, tipo, dados) {
  if (!viagem) return null;
  const ev = Object.assign({
    tipo: tipo,
    real: vgAgora(),
    em: new Date().toISOString(),
    por: (typeof MOTORISTA_ATUAL !== 'undefined' && MOTORISTA_ATUAL) || viagem.motorista || ''
  }, dados || {});
  viagem.eventos.push(ev);
  return ev;
}

// Atraso em minutos: positivo = atrasado. Derivado, nunca guardado.
function vgAtraso(previsto, real) {
  const p = vgMin(previsto), r = vgMin(real);
  if (p == null || r == null) return null;
  let d = r - p;
  // virada de meia-noite: 3o turno chega no dia seguinte
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return d;
}
function vgMin(hhmm) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
  return m ? (+m[1] * 60 + +m[2]) : null;
}

// ---- ciclo da viagem ----
function vgIniciar(viagem) {
  if (!viagem || viagem.estado !== 'programada') return false;
  viagem.estado = 'em_curso';
  viagem.inicioReal = vgAgora();
  vgRegistrar(viagem, 'partida', { previsto: viagem.inicioProgramado, real: viagem.inicioReal });
  return true;
}

// Chegar a empresa e todos desembarcarem sao eventos DIFERENTES, mesmo
// quando acontecem no mesmo minuto. A interface pode juntar num toque;
// o registro nao pode perder a distincao.
function vgChegar(viagem) {
  if (!viagem || viagem.estado !== 'em_curso') return false;
  viagem.chegadaReal = vgAgora();
  vgRegistrar(viagem, 'chegada', { previsto: viagem.chegadaProgramada, real: viagem.chegadaReal });
  return true;
}

function vgDesembarqueColetivo(viagem, viajantes) {
  if (!viagem || viagem.estado !== 'em_curso') return 0;
  const hora = vgAgora();
  let n = 0;
  (viajantes || []).forEach(v => {
    if (vgEstadoDe(viagem, v.id || v.nome) !== 'embarcou') return;
    vgRegistrar(viagem, 'desembarque', { viajante: v.id || v.nome, real: hora, coletivo: true });
    n++;
  });
  vgRegistrar(viagem, 'desembarque_coletivo', { real: hora, quantidade: n });
  return n;
}

function vgEncerrar(viagem) {
  if (!viagem || viagem.estado !== 'em_curso') return false;
  viagem.estado = 'encerrada';
  viagem.fimReal = vgAgora();
  vgRegistrar(viagem, 'fim', { real: viagem.fimReal });
  return true;
}

// ---- eventos por viajante ----
function vgEmbarcou(viagem, viajanteId, previsto, pos) {
  if (!viagem || viagem.estado !== 'em_curso') return false;
  vgRegistrar(viagem, 'embarque', Object.assign(
    { viajante: viajanteId, previsto: previsto || '' }, pos || {}));
  return true;
}

function vgAusente(viagem, viajanteId, motivo, previsto) {
  if (!viagem || viagem.estado !== 'em_curso') return false;
  vgRegistrar(viagem, 'ausencia', { viajante: viajanteId, motivo: motivo || 'outro',
                                    previsto: previsto || '' });
  return true;
}

function vgDesembarcou(viagem, viajanteId, previsto, pos) {
  if (!viagem || viagem.estado !== 'em_curso') return false;
  vgRegistrar(viagem, 'desembarque', Object.assign(
    { viajante: viajanteId, previsto: previsto || '' }, pos || {}));
  return true;
}

// Desfazer a ULTIMA acao daquele viajante. Errar acontece, e o registro
// vai para quem espera do outro lado.
function vgDesfazer(viagem, viajanteId) {
  if (!viagem) return false;
  for (let i = viagem.eventos.length - 1; i >= 0; i--) {
    const e = viagem.eventos[i];
    if (e.viajante === viajanteId && VG_EV_PESSOA.indexOf(e.tipo) >= 0) {
      viagem.eventos.splice(i, 1);
      return true;
    }
  }
  return false;
}

// Estado atual de um viajante nesta viagem.
function vgEstadoDe(viagem, viajanteId) {
  if (!viagem) return 'pendente';
  let st = 'pendente';
  viagem.eventos.forEach(e => {
    if (e.viajante !== viajanteId) return;
    if (e.tipo === 'embarque') st = 'embarcou';
    else if (e.tipo === 'ausencia') st = 'ausente';
    else if (e.tipo === 'desembarque') st = 'desembarcou';
  });
  return st;
}

// Quem falta. Na ida, quem nao embarcou nem faltou; na volta, quem
// embarcou e ainda nao desceu.
function vgPendentes(viagem, ordem) {
  if (!viagem) return [];
  return (ordem || []).filter(v => {
    const id = v.id || v.nome;
    const st = vgEstadoDe(viagem, id);
    return viagem.sentido === 'volta' ? (st !== 'desembarcou') : (st === 'pendente');
  });
}

// O proximo da fila — o que o cartao principal mostra.
function vgProximo(viagem, ordem) {
  const p = vgPendentes(viagem, ordem);
  return p.length ? p[0] : null;
}

// Quanto a viagem esta atrasada AGORA, para o aviso do topo.
function vgAtrasoAtual(viagem) {
  if (!viagem || !viagem.eventos.length) return null;
  for (let i = viagem.eventos.length - 1; i >= 0; i--) {
    const e = viagem.eventos[i];
    if (e.previsto && e.real) {
      const a = vgAtraso(e.previsto, e.real);
      if (a != null) return a;
    }
  }
  return null;
}

// Resumo da viagem, base dos relatorios de pontualidade.
function vgResumo(viagem) {
  if (!viagem) return null;
  const cont = { embarcaram: 0, ausentes: 0, desembarcaram: 0 };
  viagem.eventos.forEach(e => {
    if (e.tipo === 'embarque') cont.embarcaram++;
    else if (e.tipo === 'ausencia') cont.ausentes++;
    else if (e.tipo === 'desembarque') cont.desembarcaram++;
  });
  return Object.assign(cont, {
    sentido: viagem.sentido, estado: viagem.estado,
    atrasoSaida: vgAtraso(viagem.inicioProgramado, viagem.inicioReal),
    atrasoChegada: vgAtraso(viagem.chegadaProgramada, viagem.chegadaReal),
    duracaoMin: (vgMin(viagem.fimReal) != null && vgMin(viagem.inicioReal) != null)
      ? vgAtraso(viagem.inicioReal, viagem.fimReal) : null
  });
}

// Qual viagem vem agora — o motorista NAO escolhe ida ou volta.
function vgProximaViagem(viagens, agoraMin) {
  const emCurso = (viagens || []).find(v => v.estado === 'em_curso');
  if (emCurso) return emCurso;
  const m = (agoraMin != null) ? agoraMin : vgMin(vgAgora());
  const prog = (viagens || []).filter(v => v.estado === 'programada')
    .map(v => ({ v: v, ini: vgMin(v.inicioProgramado) }))
    .filter(x => x.ini != null)
    .sort((a, b) => Math.abs(a.ini - m) - Math.abs(b.ini - m));
  return prog.length ? prog[0].v : null;
}


// ==================================================================
// FILA OFFLINE — o motorista continua marcando sem sinal
// ------------------------------------------------------------------
// Em rota, sinal cai. Perder um embarque marcado e perder o dado que
// vai para quem espera do outro lado. Grava local, envia depois.
// ==================================================================
const VG_FILA_KEY = (typeof C !== 'undefined' && C.storageKey ? C.storageKey : 'temvia') + '_fila_viagem';
let VG_FILA = [];
let VG_ONLINE = (typeof navigator === 'undefined') || navigator.onLine !== false;

function vgFilaCarregar() {
  try { VG_FILA = JSON.parse(localStorage.getItem(VG_FILA_KEY) || '[]'); }
  catch (e) { VG_FILA = []; }
}
function vgFilaGravar() {
  try { localStorage.setItem(VG_FILA_KEY, JSON.stringify(VG_FILA)); } catch (e) {}
}
function vgFilaPor(viagem) {
  vgGuardar(viagem);
  VG_FILA.push({ viagem: viagem.id, snapshot: JSON.parse(JSON.stringify(viagem)),
                 em: new Date().toISOString() });
  vgFilaGravar();
  vgPintarSync();
  vgFilaEnviar();
}
// Uma so remessa por vez: duas chamadas simultaneas (evento novo +
// evento 'online') gravariam o mesmo snapshot duas vezes.
let VG_FILA_ENVIANDO = false;

async function vgFilaEnviar() {
  if (!VG_FILA.length || !VG_ONLINE || VG_FILA_ENVIANDO) return;
  VG_FILA_ENVIANDO = true;
  try {
    // commGetDb e como o resto deste arquivo abre o Firestore. Antes aqui
    // havia um 'db' solto, que nao existe em lugar nenhum.
    const db = await commGetDb();
    if (!db) return;
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    // A fila NAO e esvaziada antes de gravar. Se a gravacao falhar, os
    // registros continuam aqui e vao na proxima tentativa.
    const lote = VG_FILA.slice();
    const ultimo = {};
    lote.forEach(x => { ultimo[x.viagem] = x.snapshot; });

    for (const id of Object.keys(ultimo)) {
      await setDoc(doc(db, CLIENTE_ID, 'viagem_' + id), ultimo[id], { merge: true });
    }

    // Gravou: agora sim sai da fila — e so o que estava neste lote, para
    // nao levar junto o que o motorista marcou durante o envio.
    VG_FILA = VG_FILA.slice(lote.length);
    vgFilaGravar();
    vgPintarSync();

    // O passageiro le a lista do dia: sem isto ele teria de adivinhar o id
    // da viagem. So os campos que ele precisa — nem tudo da viagem interessa
    // a quem espera no ponto.
    try {
      const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const ref = doc(db, CLIENTE_ID, 'viagens_do_dia');
      const snap = await getDoc(ref);
      const hoje = (new Date()).toISOString().slice(0, 10);
      let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
      lista = lista.filter(v => v.data === hoje);
      Object.keys(ultimo).forEach(id => {
        const v = ultimo[id];
        const publico = { id: v.id, linha: v.linha, turno: v.turno, data: v.data,
          sentido: v.sentido, estado: v.estado, motorista: v.motorista,
          inicioProgramado: v.inicioProgramado, chegadaProgramada: v.chegadaProgramada,
          eventos: (v.eventos || []).map(e => ({ tipo: e.tipo, viajante: e.viajante,
            previsto: e.previsto, real: e.real, motivo: e.motivo })) };
        const k = lista.findIndex(x => x.id === id);
        if (k >= 0) lista[k] = publico; else lista.push(publico);
      });
      await setDoc(ref, { lista: lista, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) { console.warn('[viagem] lista do dia:', e && e.message); }
  } catch (e) {
    // Falhou: a fila continua cheia e a tela continua dizendo quantos
    // registros faltam. Melhor o motorista ver o numero parado do que o
    // sistema perder o dado em silencio.
    console.warn('[viagem] fila:', e && e.message);
  } finally {
    VG_FILA_ENVIANDO = false;
  }
  vgPintarSync();
}

// ==================================================================
// OCORRENCIAS — fila propria
// ------------------------------------------------------------------
// Fila separada da viagem de proposito: a fila da viagem manda o
// snapshot inteiro e e a base do relatorio; a ocorrencia e um registro
// avulso que o gestor le em outro lugar. Misturar as duas obrigaria a
// mexer no envio da viagem, que acabou de ser consertado.
//
// A gravacao usa arrayUnion: varios motoristas registram ao mesmo tempo
// e o Firestore junta sem que um apague o outro. Ler-alterar-gravar,
// como fazem os avisos, perderia registro em concorrencia.
// ==================================================================
const VG_OC_KEY = (typeof C !== 'undefined' && C.storageKey ? C.storageKey : 'temvia') + '_fila_ocorrencia';
let VG_OC_FILA = [];
let VG_OC_ENVIANDO = false;

function vgOcCarregar() {
  try { VG_OC_FILA = JSON.parse(localStorage.getItem(VG_OC_KEY) || '[]'); }
  catch (e) { VG_OC_FILA = []; }
}
function vgOcGravar() {
  try { localStorage.setItem(VG_OC_KEY, JSON.stringify(VG_OC_FILA)); } catch (e) {}
}

// A ocorrencia nasce presa a viagem: sem linha, turno e horario o gestor
// recebe um relato solto que nao da para cruzar com nada.
function vgOcMontar(tipo, texto) {
  const v = VG_ATUAL;
  const agora = new Date();
  return {
    id: 'OC-' + agora.getTime().toString(36) + Math.random().toString(36).slice(2, 5),
    tipo: tipo,
    texto: String(texto || '').slice(0, 500),
    viagem: v ? v.id : '',
    linha: v ? v.linha : (window._commLinha || ''),
    turno: v ? v.turno : (window._commTurno || ''),
    sentido: v ? v.sentido : '',
    data: v ? v.data : agora.toISOString().slice(0, 10),
    hora: vgAgora(),
    motorista: (v && v.motorista) || (document.getElementById('selMotorista') || {}).value || '',
    status: 'aberta',
    em: agora.toISOString()
  };
}

function vgOcRegistrar(tipo, texto) {
  const oc = vgOcMontar(tipo, texto);
  VG_OC_FILA.push(oc);
  vgOcGravar();
  // Tambem entra na trilha da viagem: o relatorio previsto x realizado
  // vai precisar dela na linha do tempo, junto dos embarques.
  if (VG_ATUAL) {
    vgRegistrar(VG_ATUAL, 'ocorrencia', { ocId: oc.id, ocTipo: tipo });
    vgFilaPor(VG_ATUAL);
  }
  vgOcEnviar();
  return oc;
}

async function vgOcEnviar() {
  if (!VG_OC_FILA.length || !VG_ONLINE || VG_OC_ENVIANDO) return;
  VG_OC_ENVIANDO = true;
  try {
    const db = await commGetDb();
    if (!db) return;
    const { doc, setDoc, arrayUnion } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const lote = VG_OC_FILA.slice();
    await setDoc(doc(db, CLIENTE_ID, 'ocorrencias'),
      { lista: arrayUnion.apply(null, lote), updatedAt: new Date().toISOString() },
      { merge: true });
    // So sai da fila o que o Firestore aceitou.
    VG_OC_FILA = VG_OC_FILA.slice(lote.length);
    vgOcGravar();
  } catch (e) {
    console.warn('[ocorrencia] fila:', e && e.message);
  } finally {
    VG_OC_ENVIANDO = false;
  }
}

// ==================================================================
// TELA DA VIAGEM
// ==================================================================
let VG_ATUAL = null;        // viagem em curso ou programada
let VG_ORDEM = [];          // viajantes na ordem da rota
let VG_DESFAZER = null;     // { id, ate } — janela de arrependimento

// Recupera a viagem de hoje desta linha, ou cria a programada. O
// motorista NAO escolhe ida ou volta: o horario decide.
let VG_ROTA = null;   // ultima rota escolhida, para repreparar

// A saida e a entrada invertida: quem embarca primeiro de manha mora
// mais longe da empresa e e o ultimo a descer a tarde. Servir a mesma
// ordem nos dois sentidos manda o motorista fazer o caminho ao contrario.
function vgOrdemDoSentido(naEntrada, sentido) {
  return sentido === 'volta' ? naEntrada.slice().reverse() : naEntrada;
}

function vgPreparar(rota) {
  if (!rota) return;
  VG_ROTA = rota;
  const hoje = (function () {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
           '-' + String(d.getDate()).padStart(2, '0');
  })();

  // Base: ordem de embarque da entrada.
  const naEntrada = (rota.passageiros || [])
    .filter(p => p.status !== 'desligado' && p.status !== 'ferias' && p.status !== 'afastado')
    .slice()
    .sort((a, b) => (a.horario || '99:99').localeCompare(b.horario || '99:99'));

  // ja existe viagem em andamento guardada localmente?
  const guardada = vgRecuperar(rota.id, hoje);
  if (guardada) {
    VG_ATUAL = guardada;
    VG_ORDEM = vgOrdemDoSentido(naEntrada, guardada.sentido);
    vgPintar(); vgPintarSync(); return;
  }

  const ida = vgCriar(rota, hoje, 'ida');
  const volta = vgCriar(rota, hoje, 'volta');
  VG_ATUAL = vgProximaViagem([ida, volta].filter(Boolean));
  VG_ORDEM = vgOrdemDoSentido(naEntrada, VG_ATUAL && VG_ATUAL.sentido);
  vgPintar();
  vgPintarSync();
  const lbl = document.getElementById('vgLinhaAtual');
  if (lbl) lbl.textContent = 'Linha ' + rota.linha + ' · ' + rota.turno;
}

// A viagem em curso sobrevive a recarregar a pagina: sem isso, fechar o
// app no meio da rota perderia tudo o que ja foi marcado.
function vgGuardar(v) {
  try { localStorage.setItem(VG_FILA_KEY + '_atual', JSON.stringify(v)); } catch (e) {}
}
function vgRecuperar(rotaId, dataIso) {
  try {
    const v = JSON.parse(localStorage.getItem(VG_FILA_KEY + '_atual') || 'null');
    if (v && v.rotaId === rotaId && v.data === dataIso && v.estado !== 'encerrada') return v;
  } catch (e) {}
  return null;
}

var VG_CSS = `
:root{--vgbg:#14161a;--vgcard:#1c2028;--vgtxt:#e8e6e1;--vgmut:#8b8f96;--vgbrd:#33383f}
html[data-vg-tema="claro"]{--vgbg:#fbfaf7;--vgcard:#fff;--vgtxt:#2C2C2A;--vgmut:#5F5E5A;--vgbrd:#D3D1C7}
.vg-cab{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:2px 2px 10px;font-size:0.8125rem;color:var(--vgtxt)}
.vg-quem{display:flex;align-items:center;gap:6px;background:none;border:none;color:#E8E6E1;font-size:0.875rem;font-weight:600;padding:4px 0;text-align:left}
html[data-vg-tema="claro"] .vg-quem{color:#2C2C2A}
html[data-vg-tema="claro"] .vg-cab{color:#2C2C2A}
.vg-quem svg{width:15px;height:15px;flex-shrink:0;transition:transform .15s}
.vg-quem-aberto svg{transform:rotate(180deg)}
.vg-seletores{background:var(--vgcard);border:1px solid var(--vgbrd);border-radius:12px;padding:12px;margin-bottom:10px}
.vg-dica{font-size:0.6875rem;color:var(--vgmut);line-height:1.5;margin-top:5px}
.vg-li-h{display:inline-block;font-style:normal;font-size:0.75rem;color:var(--vgmut);margin-left:8px}
.vg-sync{font-size:0.6875rem;color:var(--vgmut)}
.vg-sync-pend{color:#EF9F27}
.vg-topo{display:flex;justify-content:space-between;background:var(--vgcard);border-radius:10px;padding:8px 11px;margin-bottom:10px;font-size:0.7188rem;color:var(--vgmut)}
.vg-topo b{color:#1D9E75;font-weight:600}
.vg-topo.vg-atrasado b{color:#EF9F27}
.vg-card{background:var(--vgcard);border:1px solid var(--vgbrd);border-radius:12px;padding:14px;margin-bottom:10px}
.vg-card-foco{border:2px solid #EF9F27}
.vg-card-ok{border:2px solid #1D9E75}
.vg-card-antes{border:2px solid #378ADD}
.vg-card-fim{border:1px solid var(--vgbrd);opacity:.92}
.vg-tag{font-size:0.625rem;letter-spacing:.1em;color:#EF9F27;margin-bottom:8px}
.vg-card-ok .vg-tag{color:#1D9E75}.vg-card-antes .vg-tag{color:#378ADD}
.vg-nome{font-size:1.1875rem;font-weight:600;line-height:1.25;color:var(--vgtxt);overflow-wrap:anywhere}
.vg-titulo{font-size:1.125rem;font-weight:600;color:var(--vgtxt)}
.vg-sub,.vg-local{font-size:0.7812rem;line-height:1.45;color:var(--vgmut);margin-top:5px}
.vg-prev{font-size:0.7188rem;color:var(--vgmut);margin-top:3px}
.vg-grade{display:flex;gap:14px;margin:12px 0 4px;flex-wrap:wrap}
.vg-dado b{display:block;font-size:1.0625rem;font-weight:600;color:var(--vgtxt)}
.vg-dado span{font-size:0.6562rem;color:var(--vgmut)}
.vg-linha-info{font-size:0.7188rem;color:var(--vgmut);margin-top:8px}
.vg-btn{border-radius:9px;font-size:0.9375rem;padding:0.94em 1em;min-height:48px;border:none;cursor:pointer;font-weight:500}
.vg-btn-grande{width:100%;margin-top:13px;background:#1D9E75;color:#04342C}
.vg-card-antes .vg-btn-grande{background:#378ADD;color:#042C53}
.vg-btn-nav{width:100%;margin-top:12px;background:transparent;border:1px solid var(--vgbrd);color:var(--vgtxt);padding:0.8em;min-height:46px;font-size:0.875rem}
.vg-acoes{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
.vg-acoes .vg-btn{min-width:44%}
.vg-flex2{flex:2}
.vg-btn-ok{flex:2;background:#1D9E75;color:#04342C}
.vg-btn-nao{flex:1;background:transparent;border:1px solid #A32D2D;color:#F09595;font-size:0.875rem}
.vg-btn-mini{padding:8px 12px;font-size:0.7812rem;flex:none}
.vg-btn-motivo{width:100%;margin-bottom:7px;background:var(--vgcard);border:1px solid var(--vgbrd);color:var(--vgtxt);font-size:0.875rem;text-align:left}
.vg-btn-cancel{width:100%;margin-top:6px;background:transparent;border:1px solid var(--vgbrd);color:var(--vgmut);font-size:0.875rem}
.vg-desfazer{display:flex;justify-content:space-between;align-items:center;background:var(--vgcard);border:1px solid var(--vgbrd);border-radius:9px;padding:9px 12px;margin-bottom:10px;font-size:0.75rem;color:var(--vgmut)}
.vg-desfazer button{background:none;border:none;color:#EF9F27;font-size:0.7812rem;font-weight:600;cursor:pointer}
.vg-atalhos{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
.vg-atalho{position:relative;background:var(--vgcard);border:1px solid var(--vgbrd);color:var(--vgtxt);border-radius:9px;padding:0.9em 0.4em;min-height:56px;font-size:0.7188rem;cursor:pointer}
.vg-atalho svg{width:16px;height:16px;display:block;margin:0 auto 3px}
.vg-badge{position:absolute;top:5px;right:14px;background:#E24B4A;color:#fff;font-size:0.5938rem;border-radius:9px;padding:1px 5px;font-style:normal}
.vg-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px}
.vg-ov-caixa{background:var(--vgbg);border:1px solid var(--vgbrd);border-radius:14px;padding:16px;max-width:340px;width:100%}
.vg-ov-lista{max-height:80vh;overflow:auto}
.vg-ov-tit{font-size:0.9375rem;font-weight:600;color:var(--vgtxt);margin-bottom:12px}
.vg-li{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--vgbrd)}
.vg-li b{display:block;font-size:0.8438rem;color:var(--vgtxt);font-weight:500}
.vg-li span{display:block;font-size:0.6875rem;color:var(--vgmut)}
.vg-st{font-size:0.7188rem;color:var(--vgmut);font-style:normal}
.vg-li-ausente .vg-st{color:#F09595}
.vg-li-embarcou .vg-st,.vg-li-desembarcou .vg-st{color:#1D9E75}
.vg-btn-ouro{width:100%;margin-bottom:8px;background:#FBAE17;border:1px solid #FBAE17;color:#14161a;font-weight:600;font-size:0.9375rem;min-height:48px}
.vg-btn-sel{border-color:#EF9F27;color:#EF9F27}
.vg-depois{background:var(--vgcard);border:1px solid var(--vgbrd);border-radius:12px;padding:11px 13px;margin-bottom:10px}
.vg-dep-tit{font-size:0.625rem;letter-spacing:.09em;color:var(--vgmut);margin-bottom:7px}
.vg-dep-li{display:flex;gap:11px;align-items:baseline;padding:4px 0;font-size:0.8125rem;color:var(--vgtxt)}
.vg-dep-li i{font-style:normal;font-size:0.75rem;color:var(--vgmut);min-width:42px}
.vg-dep-fim{border-top:1px solid var(--vgbrd);margin-top:5px;padding-top:7px}
.vg-dep-fim span{color:var(--vgmut)}
.vg-dep-mais{font-size:0.6875rem;color:var(--vgmut);padding:4px 0 0 53px}
.vg-ov-mais{max-height:85vh;overflow:auto}
.vg-mais-item{position:relative;display:flex;align-items:center;gap:11px;width:100%;background:var(--vgcard);border:1px solid var(--vgbrd);color:var(--vgtxt);border-radius:10px;padding:0.85em 0.9em;margin-bottom:7px;font-size:0.875rem;font-family:inherit;text-align:left;cursor:pointer}
.vg-mais-item svg{width:18px;height:18px;flex-shrink:0;color:var(--vgmut)}
.vg-mais-item .vg-badge{position:static;margin-left:auto}
.vg-aviso{border-top:1px solid var(--vgbrd);padding:11px 0}
.vg-aviso-top{display:flex;justify-content:space-between;gap:10px;font-size:0.6875rem;color:var(--vgmut);margin-bottom:5px}
.vg-aviso-txt{font-size:0.8438rem;color:var(--vgtxt);line-height:1.5;white-space:pre-wrap}
.vg-aviso-link{display:inline-block;margin-top:6px;font-size:0.75rem;color:#EF9F27;text-decoration:none}
.vg-vazio{font-size:0.8125rem;color:var(--vgmut);text-align:center;padding:26px 8px}
.vg-barra{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:9px;padding:9px 13px calc(9px + env(safe-area-inset-bottom));background:var(--vgbg);border-top:1px solid var(--vgbrd)}
.vg-barra .vg-atalho{flex:1;margin:0}
.vg-barra-so-mais{justify-content:flex-end}
.vg-barra-so-mais .vg-atalho{flex:0 0 78px}
.vg-oc-lbl{font-size:0.6875rem;letter-spacing:.06em;color:var(--vgmut);margin-bottom:7px}
.vg-oc-txt{width:100%;box-sizing:border-box;background:var(--vgcard);border:1px solid var(--vgbrd);border-radius:10px;padding:10px 12px;color:var(--vgtxt);font-size:0.875rem;font-family:inherit;resize:vertical;margin-bottom:10px}
.vg-oc-pend{font-size:0.6875rem;color:#EF9F27;margin-bottom:8px}
.vg-btn-grande[disabled]{opacity:.45}
.vg-cobertura{background:rgba(239,159,39,0.10);border:1px solid rgba(239,159,39,0.45);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:0.75rem;line-height:1.5;color:var(--vgtxt)}
.vg-cobertura strong{color:#C97B0A;font-weight:600}
html[data-vg-tema="escuro"] .vg-cobertura strong{color:#EF9F27}
`;

// O estilo entra na primeira pintura: aqui o VG_CSS ja tem valor.
// Antes ele era injetado no topo do arquivo, onde ainda valia undefined.
let VG_CSS_POSTO = false;
function vgPorEstilo() {
  if (VG_CSS_POSTO) return;
  VG_CSS_POSTO = true;
  document.head.insertAdjacentHTML('beforeend', '<style>' + VG_CSS + '</style>');
}


// ==================================================================
// CABECALHO: quem sou e qual linha
// ------------------------------------------------------------------
// Os seletores ficavam sempre visiveis, abaixo da tela da viagem —
// duplicando a interface. Agora recolhem assim que a rota esta
// escolhida, e voltam a um toque no nome.
// ==================================================================
function vgSeletoresVisiveis(mostrar) {
  const box = document.getElementById('vgSeletores');
  const btn = document.getElementById('vgQuem');
  if (box) box.style.display = mostrar ? '' : 'none';
  if (btn) btn.classList.toggle('vg-quem-aberto', !!mostrar);
}

function vgAbrirTroca() {
  const box = document.getElementById('vgSeletores');
  vgSeletoresVisiveis(!box || box.style.display === 'none');
}

// O nome no cabecalho: motorista + linha, para ele saber o que esta rodando.
function vgAtualizarCabecalho() {
  const el = document.getElementById('vgQuemNome');
  const cab = document.getElementById('vgCab');
  if (!el) return;
  const mot = (document.getElementById('selMotorista') || {}).value || '';
  const sel = document.getElementById('selLinha');
  const linha = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '';
  el.textContent = mot ? (linha ? mot + ' \u00b7 ' + linha : mot) : '';
  // Sem nome escolhido o cabecalho fica fora da tela: o rotulo logo
  // abaixo ja pede a mesma coisa, e a caixa vazia parecia botao.
  if (cab) cab.style.display = mot ? '' : 'none';
}

// A tela antiga da rota so vale quando NAO ha viagem montada. Deixar as
// duas juntas foi o que produziu a tela duplicada.
function vgEsconderAntiga(esconder) {
  const rc = document.getElementById('rotaContent');
  if (rc) rc.style.display = esconder ? 'none' : '';
}

// As abas do topo saem de cena durante a viagem. Quem precisar delas
// chega pelo + Mais..., que reaproveita o mesmo trocarAba().
function vgAbasVisiveis(mostrar) {
  const b = document.getElementById('abaRotaBtn');
  const barra = b ? b.parentElement : null;
  if (barra) barra.style.display = mostrar ? '' : 'none';
}

// So faz sentido esconder as abas quando a tela em foco E a da rota.
// Sem esta guarda, um vgPintar disparado enquanto o motorista esta na
// Busca apagava as abas e ele ficava sem caminho de volta.
function vgNaAbaRota() {
  const el = document.getElementById('abaRota');
  return !el || el.style.display !== 'none';
}

function vgPintar() {
  vgPorEstilo();
  const el = document.getElementById('vgTela');
  if (!el) return;
  vgAtualizarCabecalho();
  if (!VG_ATUAL) {
    el.innerHTML = ''; vgEsconderAntiga(false); vgAbasVisiveis(true);
    vgBarraPintar();   // o + Mais existe mesmo sem viagem escolhida
    return;
  }
  // ha viagem: a tela da viagem e a unica
  vgEsconderAntiga(true);
  vgAbasVisiveis(!vgNaAbaRota());
  vgSeletoresVisiveis(false);
  const v = VG_ATUAL;

  if (v.estado === 'programada') return vgPintarAntes(el, v);
  if (v.estado === 'encerrada') return vgPintarEncerrada(el, v);

  const prox = vgProximo(v, VG_ORDEM);
  if (prox) return vgPintarProximo(el, v, prox);
  if (!v.chegadaReal) return vgPintarACaminho(el, v);
  return vgPintarChegou(el, v);
}

// ---- 1. antes de iniciar ----
function vgPintarAntes(el, v) {
  const sentido = v.sentido === 'volta' ? 'Retorno' : 'Entrada';
  const trajeto = v.sentido === 'volta' ? 'Empresa → passageiros' : 'Garagem → empresa';
  el.innerHTML =
    '<div class="vg-card vg-card-antes">' +
      '<div class="vg-tag">PRÓXIMA VIAGEM</div>' +
      '<div class="vg-titulo">Linha ' + esc(v.linha) + ' · ' + esc(v.turno) + '</div>' +
      '<div class="vg-sub">' + sentido + ' · ' + trajeto + '</div>' +
      '<div class="vg-grade">' +
        vgDado(VG_ORDEM.length, 'passageiros') +
        vgDado(v.inicioProgramado || '--:--', 'saída programada') +
        (v.chegadaProgramada ? vgDado(v.chegadaProgramada, 'chegada prevista') : '') +
      '</div>' +
      '<div class="vg-linha-info">' + esc(v.motorista || 'Motorista a definir') +
        (v.veiculo ? ' · ' + esc(v.veiculo) : '') + '</div>' +
      '<button class="vg-btn vg-btn-ouro" onclick="vgUiLocalizacao()">' +
        'Compartilhar localização da van</button>' +
      '<button class="vg-btn vg-btn-grande" onclick="vgUiIniciar()">Iniciar rota</button>' +
    '</div>';
}

function vgDado(valor, rotulo) {
  return '<div class="vg-dado"><b>' + esc(String(valor)) + '</b><span>' + rotulo + '</span></div>';
}

// ---- 2. próximo embarque / desembarque ----
function vgPintarProximo(el, v, p) {
  const volta = v.sentido === 'volta';
  const total = VG_ORDEM.length;
  const feitos = total - vgPendentes(v, VG_ORDEM).length;
  const previsto = p.horario || '';
  const atraso = vgAtrasoAtual(v);

  el.innerHTML =
    vgBarraTopo(v, atraso) +
    '<div class="vg-card vg-card-foco">' +
      '<div class="vg-tag">' + (volta ? 'PRÓXIMO DESEMBARQUE' : 'PRÓXIMO EMBARQUE') +
        ' · ' + (feitos + 1) + ' DE ' + total + '</div>' +
      '<div class="vg-nome">' + esc(p.nome) + '</div>' +
      '<div class="vg-local">' + esc(p.embarque || p.endereco || '—') + '</div>' +
      (previsto ? '<div class="vg-prev">previsto ' + esc(previsto) + '</div>' : '') +
      '<button class="vg-btn vg-btn-nav" onclick="vgUiNavegar()">Navegar</button>' +
      '<div class="vg-acoes">' +
        (volta
          ? '<button class="vg-btn vg-btn-ok vg-flex2" onclick="vgUiDesembarcou()">Desembarcou</button>'
          : '<button class="vg-btn vg-btn-ok vg-flex2" onclick="vgUiEmbarcou()">Embarcou</button>' +
            '<button class="vg-btn vg-btn-nao" onclick="vgUiAusente()">Ausente</button>') +
      '</div>' +
    '</div>' +
    vgDepoisHtml(v, p) +
    vgDesfazerHtml() + vgAtalhos();
}

// ---- lista DEPOIS: as proximas paradas, sem acao ----
// So leitura. Marcar fora de ordem continua sendo pela Lista completa —
// botao pequeno com o veiculo em movimento e toque errado garantido.
function vgDepoisHtml(v, atual) {
  const ka = atual ? (atual.id || atual.nome) : null;
  const pend = vgPendentes(v, VG_ORDEM).filter(p => (p.id || p.nome) !== ka);
  const volta = v.sentido === 'volta';
  const linhas = pend.slice(0, 4).map(p =>
    '<div class="vg-dep-li"><i>' + esc(p.horario || '--:--') + '</i>' +
    '<span>' + esc(p.nome) + '</span></div>').join('');
  const fim = v.chegadaProgramada
    ? '<div class="vg-dep-li vg-dep-fim"><i>' + esc(v.chegadaProgramada) + '</i>' +
      '<span>' + (volta ? 'Garagem' : 'Chegada \u00b7 empresa') + '</span></div>'
    : '';
  if (!linhas && !fim) return '';
  const resto = pend.length > 4
    ? '<div class="vg-dep-mais">+ ' + (pend.length - 4) + ' na lista completa</div>' : '';
  return '<div class="vg-depois"><div class="vg-dep-tit">DEPOIS</div>' +
    linhas + resto + fim + '</div>';
}

// ---- 3. todos processados, a caminho ----
function vgPintarACaminho(el, v) {
  const r = vgResumo(v);
  const volta = v.sentido === 'volta';
  // Na volta ninguem embarca no caminho: o que se conta e quem desceu.
  const feitos = volta ? r.desembarcaram : r.embarcaram;
  const verbo = volta ? ' desembarcaram' : ' embarcaram';
  el.innerHTML =
    vgBarraTopo(v, vgAtrasoAtual(v)) +
    '<div class="vg-card vg-card-ok">' +
      '<div class="vg-tag">' + (volta ? 'TODOS OS DESEMBARQUES FEITOS'
                                      : 'TODOS OS PASSAGEIROS PROCESSADOS') + '</div>' +
      '<div class="vg-nome">' + feitos + verbo +
        (r.ausentes ? ' · ' + r.ausentes + ' ausente' + (r.ausentes > 1 ? 's' : '') : '') + '</div>' +
      '<div class="vg-local">A caminho da ' + vgDestinoNome(v) +
        (v.chegadaProgramada ? ' · chegada prevista ' + esc(v.chegadaProgramada) : '') + '</div>' +
      '<button class="vg-btn vg-btn-nav" onclick="vgUiNavegarDestino()">Navegar</button>' +
      '<button class="vg-btn vg-btn-grande" onclick="vgUiChegou()">Cheguei ' +
        (v.sentido === 'volta' ? 'à garagem' : 'à empresa') + '</button>' +
    '</div>' + vgDesfazerHtml() + vgAtalhos();
}

// ---- 4. chegou: desembarque coletivo e encerrar ----
function vgPintarChegou(el, v) {
  const r = vgResumo(v);
  const desceram = r.desembarcaram;
  el.innerHTML =
    vgBarraTopo(v, vgAtraso(v.chegadaProgramada, v.chegadaReal)) +
    '<div class="vg-card vg-card-ok">' +
      '<div class="vg-tag">' + (v.sentido === 'volta' ? 'CHEGAMOS À GARAGEM' : 'CHEGAMOS À EMPRESA') +
        ' · ' + esc(v.chegadaReal) + '</div>' +
      (desceram
        ? '<div class="vg-nome">' + desceram + ' desembarcaram</div>' +
          '<div class="vg-local">Registrado. Falta encerrar a viagem.</div>' +
          '<button class="vg-btn vg-btn-grande" onclick="vgUiEncerrar()">Encerrar ' +
            (v.sentido === 'volta' ? 'retorno' : 'ida') + '</button>'
        : '<div class="vg-nome">' + r.embarcaram + ' a bordo</div>' +
          '<div class="vg-local">Registre o desembarque para fechar a viagem.</div>' +
          '<button class="vg-btn vg-btn-grande" onclick="vgUiDesembarqueTodos()">Todos desembarcaram</button>') +
    '</div>' + vgAtalhos();
}

// ---- 5. encerrada ----
function vgPintarEncerrada(el, v) {
  const r = vgResumo(v);
  const at = r.atrasoChegada;
  el.innerHTML =
    '<div class="vg-card vg-card-fim">' +
      '<div class="vg-tag">VIAGEM ENCERRADA · ' + esc(v.fimReal) + '</div>' +
      '<div class="vg-nome">' + (v.sentido === 'volta' ? 'Retorno' : 'Entrada') +
        ' · Linha ' + esc(v.linha) + '</div>' +
      '<div class="vg-grade">' +
        vgDado(r.embarcaram, 'embarcaram') +
        vgDado(r.ausentes, 'ausentes') +
        (at != null && Math.abs(at) <= 120
          ? vgDado((at > 0 ? '+' : '') + at + ' min', 'na chegada') : '') +
      '</div>' +
    '</div>' + vgAtalhos();
}

// Na ida o destino e a empresa; na volta a van termina na garagem.
// Estava fixo em "empresa" nos tres lugares, inclusive no retorno.
function vgDestinoNome(v) {
  return (v && v.sentido === 'volta') ? 'garagem' : 'empresa';
}

// ---- barra do topo: atraso e sincronização ----
function vgBarraTopo(v, atraso) {
  // Diferenca acima de 2h nao e atraso: e relogio fora de contexto
  // (teste, viagem de outro dia). Mostrar "-337 min" so confunde.
  const fora = (atraso != null && Math.abs(atraso) > 120);
  const txt = (atraso == null || fora) ? 'no horário'
    : (atraso > 0 ? '+' + atraso + ' min' : (atraso < 0 ? atraso + ' min' : 'no horário'));
  const cls = (!fora && atraso != null && atraso > 5) ? ' vg-atrasado' : '';
  // Dizer O DESTINO, nao so "chegada": na volta nao e a empresa.
  const onde = vgDestinoNome(v);
  return '<div class="vg-topo' + cls + '">' +
    '<span>' + (v.chegadaProgramada
      ? 'Chegada prevista na ' + esc(onde) + ' ' + esc(v.chegadaProgramada)
      : 'Em rota') + '</span>' +
    '<b>' + txt + '</b></div>';
}

function vgPintarSync() {
  const el = document.getElementById('vgSync');
  if (!el) return;
  if (!VG_FILA.length) {
    el.className = 'vg-sync';
    el.textContent = VG_ONLINE ? 'sincronizado' : 'sem conexão';
    return;
  }
  el.className = 'vg-sync vg-sync-pend';
  el.textContent = (VG_ONLINE ? '' : 'sem conexão · ') + VG_FILA.length +
    (VG_FILA.length > 1 ? ' registros para enviar' : ' registro para enviar');
}

// ---- desfazer temporário ----
function vgDesfazerHtml() {
  if (!VG_DESFAZER || Date.now() > VG_DESFAZER.ate) return '';
  return '<div class="vg-desfazer">' +
    '<span>' + esc(VG_DESFAZER.rotulo) + '</span>' +
    '<button onclick="vgUiDesfazer()">Desfazer</button></div>';
}
function vgArmarDesfazer(id, rotulo) {
  VG_DESFAZER = { id: id, rotulo: rotulo, ate: Date.now() + 8000 };
  setTimeout(() => {
    if (VG_DESFAZER && Date.now() >= VG_DESFAZER.ate) { VG_DESFAZER = null; vgPintar(); }
  }, 8200);
}

// ---- atalhos ----
// A barra ficou FIXA no rodape (#vgBarra), fora do #vgTela: assim ela
// sobrevive a troca de aba. Aqui so resta manter o conteudo em dia.
function vgAtalhos() {
  vgBarraPintar();
  return '';
}

// Lista completa so faz sentido com viagem montada; o + Mais e sempre.
function vgBarraPintar() {
  const barra = document.getElementById('vgBarra');
  if (!barra) return;
  const n = vgAvisosNaoLidos();
  const temViagem = !!VG_ATUAL;
  barra.innerHTML =
    (temViagem
      ? vgAtalho('vgUiLista()', 'Lista completa', 'M4 6h16M4 12h16M4 18h10')
      : '') +
    vgAtalho('vgUiMais()', '', 'M12 5v14M5 12h14', n);
  barra.className = 'vg-barra' + (temViagem ? '' : ' vg-barra-so-mais');
}
// rotulo vazio = so o icone (caso do + Mais).
function vgAtalho(acao, rotulo, path, badge) {
  return '<button class="vg-atalho" onclick="' + acao + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>' +
    rotulo + (badge ? '<i class="vg-badge">' + badge + '</i>' : '') + '</button>';
}

// ---- ações ----
function vgUiIniciar() {
  if (!vgIniciar(VG_ATUAL)) return;
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiNavegar() {
  const p = vgProximo(VG_ATUAL, VG_ORDEM);
  if (!p) return;
  const c = (p.lat && p.lng) ? p.lat + ',' + p.lng
    : encodeURIComponent((p.embarque || p.endereco || '') + ', ' + (p.cidade || 'Sorocaba') + ' SP');
  window.open('https://www.google.com/maps/dir/?api=1&destination=' + c + '&travelmode=driving', '_blank');
}
// Navegar para o fim do trajeto: empresa na ida, garagem na volta.
// Sem coordenada nao adianta abrir o Maps em branco — melhor dizer.
function vgUiNavegarDestino() {
  const v = VG_ATUAL;
  const volta = v && v.sentido === 'volta';
  const c = volta
    ? (typeof GARAGEM_COORDS !== 'undefined' ? GARAGEM_COORDS : null)
    : (typeof EMPRESA_COORDS !== 'undefined' ? EMPRESA_COORDS : null);
  if (!c || c.lat == null || c.lng == null) {
    alert('Sem coordenada ' + (volta ? 'da garagem' : 'da empresa') +
          ' no cadastro. Avise o gestor.');
    return;
  }
  window.open('https://www.google.com/maps/dir/?api=1&destination=' +
    c.lat + ',' + c.lng + '&travelmode=driving', '_blank');
}

function vgUiEmbarcou(id) {
  const p = id ? VG_ORDEM.find(x => (x.id || x.nome) === id) : vgProximo(VG_ATUAL, VG_ORDEM);
  if (!p) return;
  const k = p.id || p.nome;
  vgEmbarcou(VG_ATUAL, k, p.horario || '');
  vgArmarDesfazer(k, p.nome.split(' ')[0] + ' embarcou');
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiDesembarcou(id) {
  const p = id ? VG_ORDEM.find(x => (x.id || x.nome) === id) : vgProximo(VG_ATUAL, VG_ORDEM);
  if (!p) return;
  const k = p.id || p.nome;
  vgDesembarcou(VG_ATUAL, k, p.horario || '');
  vgArmarDesfazer(k, p.nome.split(' ')[0] + ' desembarcou');
  vgFilaPor(VG_ATUAL); vgPintar();
}

// Ausente pede motivo em DOIS toques. Sem isso o relatorio diz que
// faltou quem so mudou de ponto.
function vgUiAusente(id) {
  const p = id ? VG_ORDEM.find(x => (x.id || x.nome) === id) : vgProximo(VG_ATUAL, VG_ORDEM);
  if (!p) return;
  const k = p.id || p.nome;
  let ov = document.getElementById('vgMotivoOv');
  if (ov) ov.remove();
  ov = document.createElement('div');
  ov.id = 'vgMotivoOv';
  ov.className = 'vg-ov';
  ov.innerHTML = '<div class="vg-ov-caixa">' +
    '<div class="vg-ov-tit">' + esc(p.nome) + ' não embarcou</div>' +
    VG_MOTIVOS_AUSENCIA.map(m =>
      '<button class="vg-btn vg-btn-motivo" onclick="vgUiConfirmarAusencia(&#39;' +
      escAttrM(k) + '&#39;,&#39;' + m.id + '&#39;)">' + m.rotulo + '</button>').join('') +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharMotivo()">Cancelar</button>' +
    '</div>';
  document.body.appendChild(ov);
}
function escAttrM(t) {
  return String(t || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function vgFecharMotivo() {
  const ov = document.getElementById('vgMotivoOv');
  if (ov) ov.remove();
}
function vgUiConfirmarAusencia(k, motivo) {
  const p = VG_ORDEM.find(x => (x.id || x.nome) === k);
  vgAusente(VG_ATUAL, k, motivo, p ? p.horario : '');
  vgArmarDesfazer(k, (p ? p.nome.split(' ')[0] : 'Passageiro') + ' marcado como ausente');
  vgFecharMotivo();
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiDesfazer() {
  if (!VG_DESFAZER) return;
  vgDesfazer(VG_ATUAL, VG_DESFAZER.id);
  VG_DESFAZER = null;
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiChegou() {
  if (!vgChegar(VG_ATUAL)) return;
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiDesembarqueTodos() {
  vgDesembarqueColetivo(VG_ATUAL, VG_ORDEM);
  vgFilaPor(VG_ATUAL); vgPintar();
}
function vgUiEncerrar() {
  if (!vgEncerrar(VG_ATUAL)) return;
  vgFilaPor(VG_ATUAL); vgPintar();
}

// Embarque fora de ordem: pela Lista, sem poluir a tela principal.
function vgUiLista() {
  let ov = document.getElementById('vgListaOv');
  if (ov) ov.remove();
  ov = document.createElement('div');
  ov.id = 'vgListaOv';
  ov.className = 'vg-ov';
  const volta = VG_ATUAL && VG_ATUAL.sentido === 'volta';
  ov.innerHTML = '<div class="vg-ov-caixa vg-ov-lista">' +
    '<div class="vg-ov-tit">Todos os passageiros</div>' +
    VG_ORDEM.map(p => {
      const k = p.id || p.nome;
      const st = VG_ATUAL ? vgEstadoDe(VG_ATUAL, k) : 'pendente';
      const rot = { pendente: '', embarcou: 'Embarcou', ausente: 'Ausente',
                    desembarcou: 'Desembarcou' }[st];
      return '<div class="vg-li vg-li-' + st + '">' +
        '<div><b>' + esc(p.nome) + '</b>' +
        // o horario previsto e o que o motorista procura na lista
        (p.horario ? '<i class="vg-li-h">' + esc(p.horario) + '</i>' : '') +
        '<span>' + esc(p.embarque || p.endereco || '') + '</span></div>' +
        (st === 'pendente'
          ? '<button class="vg-btn vg-btn-ok vg-btn-mini" onclick="' +
            (volta ? 'vgUiDesembarcou' : 'vgUiEmbarcou') + '(&#39;' + escAttrM(k) + '&#39;);vgFecharLista()">' +
            (volta ? 'Desembarcou' : 'Embarcou') + '</button>'
          : '<i class="vg-st">' + rot + '</i>') + '</div>';
    }).join('') +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharLista()">Fechar</button>' +
    '</div>';
  document.body.appendChild(ov);
}
function vgFecharLista() {
  const ov = document.getElementById('vgListaOv');
  if (ov) ov.remove();
  vgPintar();
}
// ==================================================================
// + MAIS... — tudo o que nao e a parada da vez
// ------------------------------------------------------------------
// Em movimento, cada botao a mais na tela e um erro a mais. O que se
// usa a cada parada fica na tela; o resto mora aqui.
// ==================================================================
function vgUiMais() {
  vgFecharMais();
  const n = vgAvisosNaoLidos();
  const ov = document.createElement('div');
  ov.id = 'vgMaisOv';
  ov.className = 'vg-ov';
  ov.innerHTML = '<div class="vg-ov-caixa vg-ov-mais">' +
    '<div class="vg-ov-tit">Mais</div>' +
    vgItemMais('vgMaisIr(&#39;rota&#39;)', 'Minha rota',
      'M4 17h3l2-9 3 12 2.5-7H20') +
    vgItemMais('vgMaisIr(&#39;hoje&#39;)', 'Rotas de hoje',
      'M4 5h16v15H4zM4 9h16M9 3v4M15 3v4') +
    vgItemMais('vgMaisIr(&#39;busca&#39;)', 'Buscar passageiro',
      'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16.5 16.5 21 21') +
    vgItemMais('vgUiTrocarLinha()', 'Alterar linha',
      'M4 8h13l-3-3M20 16H7l3 3') +
    vgItemMais('vgUiAvisos()', 'Comunicados',
      'M4 10v4h3l6 4V6l-6 4H4ZM17 9.5a4 4 0 0 1 0 5', n) +
    vgItemMais('vgUiOcorrencia()', 'Registrar ocorr\u00eancia',
      'M12 3 2 20h20L12 3ZM12 9v5M12 17.5v.5') +
    vgItemMais('vgUiLocalizacao()', 'Compartilhar localiza\u00e7\u00e3o',
      'M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11ZM12 10.5a1.5 1.5 0 1 0 0-.1') +
    vgItemMais('vgUiTrocarMotorista()', 'Trocar de motorista',
      'M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7') +
    vgItemMais('vgUiTema()', 'Tema da tela',
      'M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z') +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharMais()">Fechar</button>' +
    '</div>';
  document.body.appendChild(ov);
}

function vgItemMais(acao, rotulo, path, badge) {
  return '<button class="vg-mais-item" onclick="' + acao + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>' +
    '<span>' + rotulo + '</span>' +
    (badge ? '<i class="vg-badge">' + badge + '</i>' : '') + '</button>';
}

function vgFecharMais() {
  const ov = document.getElementById('vgMaisOv');
  if (ov) ov.remove();
}

// As abas do topo somem durante a viagem; e por aqui que se chega a elas.
function vgMaisIr(aba) {
  vgFecharMais();
  if (typeof trocarAba === 'function') trocarAba(aba);
  vgAbasVisiveis(aba !== 'rota' || !VG_ATUAL);
}

// Alterar linha saiu do cabecalho: la parecia texto, nao botao.
function vgUiTrocarLinha() {
  vgFecharMais();
  if (typeof trocarAba === 'function') trocarAba('rota');
  vgAbasVisiveis(false);
  vgSeletoresVisiveis(true);
  const box = document.getElementById('vgSeletores');
  if (box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================================================================
// COMUNICADOS — leitura dos avisos publicados
// ------------------------------------------------------------------
// O botao abria o CHAT da linha. O chat sai: o motorista dirigindo nao
// responde mensagem. Ficam os avisos que o gestor e a empresa cliente
// publicam, no MESMO documento que o app do passageiro ja le
// (CLIENTE_ID/avisos) — nada de estrutura nova.
// ==================================================================
let VG_AVISOS = [];
let VG_AVISOS_VISTOS = 0;

function vgAvisosChave() {
  if (window._commChave) return window._commChave;
  const v = VG_ATUAL;
  return v ? (String(v.linha) + '_' + v.turno) : '';
}

// Aviso geral (sem chave) ou da linha que esta rodando.
function vgAvisosMeus() {
  const chave = vgAvisosChave();
  return (VG_AVISOS || [])
    .filter(a => !a.chave || a.chave === chave)
    .sort((x, y) => String(y.em || '').localeCompare(String(x.em || '')));
}

function vgAvisosNaoLidos() {
  const n = vgAvisosMeus().length - VG_AVISOS_VISTOS;
  return n > 0 ? n : 0;
}

function vgAvisosVistosCarregar() {
  try { VG_AVISOS_VISTOS = +(localStorage.getItem('vg_avisos_vistos') || 0) || 0; }
  catch (e) { VG_AVISOS_VISTOS = 0; }
}

async function vgAvisosBuscar() {
  try {
    const db = await commGetDb();
    if (!db) return;
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'avisos'));
    VG_AVISOS = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
  } catch (e) {
    // Sem rede o motorista continua rodando a viagem: avisos nao sao criticos.
    VG_AVISOS = VG_AVISOS || [];
  }
  vgPintar();
}

async function vgUiAvisos() {
  vgFecharMais();
  await vgAvisosBuscar();
  const meus = vgAvisosMeus();
  VG_AVISOS_VISTOS = meus.length;
  try { localStorage.setItem('vg_avisos_vistos', String(VG_AVISOS_VISTOS)); } catch (e) {}

  const ov = document.createElement('div');
  ov.id = 'vgAvisosOv';
  ov.className = 'vg-ov';
  ov.innerHTML = '<div class="vg-ov-caixa vg-ov-lista">' +
    '<div class="vg-ov-tit">Comunicados</div>' +
    (meus.length
      ? meus.map(a => {
          const d = a.em ? new Date(a.em) : null;
          const data = d && !isNaN(d)
            ? d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit',
                                          hour: '2-digit', minute: '2-digit' })
            : '';
          const corpo = esc(a.txt || '');
          return '<div class="vg-aviso">' +
            '<div class="vg-aviso-top"><span>' + esc(a.autor || 'Gest\u00e3o') + '</span>' +
              '<span>' + data + '</span></div>' +
            '<div class="vg-aviso-txt">' + corpo + '</div>' +
            (a.link ? '<a class="vg-aviso-link" href="' + esc(a.link) +
                      '" target="_blank" rel="noopener">Abrir anexo</a>' : '') +
          '</div>';
        }).join('')
      : '<div class="vg-vazio">Nenhum comunicado no momento.</div>') +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharAvisos()">Fechar</button>' +
    '</div>';
  document.body.appendChild(ov);
}

function vgFecharAvisos() {
  const ov = document.getElementById('vgAvisosOv');
  if (ov) ov.remove();
  vgPintar();
}

function vgUiOcorrencia() {
  vgFecharMais();
  vgFecharOc();
  const pend = VG_OC_FILA.length;
  const ov = document.createElement('div');
  ov.id = 'vgOcOv';
  ov.className = 'vg-ov';
  ov.innerHTML = '<div class="vg-ov-caixa vg-ov-lista">' +
    '<div class="vg-ov-tit">Registrar ocorr\u00eancia</div>' +
    '<div class="vg-oc-lbl">O que aconteceu?</div>' +
    '<div id="vgOcTipos">' +
      VG_TIPOS_OCORRENCIA.map(o =>
        '<button class="vg-btn vg-btn-motivo" data-oc="' + o.id + '" ' +
        'onclick="vgUiOcTipo(&#39;' + o.id + '&#39;)">' + o.rotulo + '</button>').join('') +
    '</div>' +
    '<div class="vg-oc-lbl" style="margin-top:12px">Detalhe (opcional)</div>' +
    '<textarea id="vgOcTexto" class="vg-oc-txt" rows="3" maxlength="500" ' +
      'placeholder="Ex.: Av. Ipanema interditada, desvio pela Marginal."></textarea>' +
    (pend ? '<div class="vg-oc-pend">' + pend +
            (pend > 1 ? ' ocorr\u00eancias aguardando envio' : ' ocorr\u00eancia aguardando envio') +
            '</div>' : '') +
    '<button class="vg-btn vg-btn-grande" id="vgOcOk" onclick="vgUiOcSalvar()" disabled>' +
      'Registrar</button>' +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharOc()">Cancelar</button>' +
    '</div>';
  document.body.appendChild(ov);
}

let VG_OC_TIPO = '';

function vgUiOcTipo(id) {
  VG_OC_TIPO = id;
  const cx = document.getElementById('vgOcTipos');
  if (cx) [...cx.querySelectorAll('button')].forEach(b =>
    b.classList.toggle('vg-btn-sel', b.getAttribute('data-oc') === id));
  const ok = document.getElementById('vgOcOk');
  if (ok) ok.disabled = false;
}

function vgUiOcSalvar() {
  if (!VG_OC_TIPO) return;
  const el = document.getElementById('vgOcTexto');
  const oc = vgOcRegistrar(VG_OC_TIPO, el ? el.value : '');
  VG_OC_TIPO = '';
  vgFecharOc();
  const rot = (VG_TIPOS_OCORRENCIA.find(x => x.id === oc.tipo) || {}).rotulo || 'Ocorr\u00eancia';
  alert('Registrado: ' + rot + ' \u00e0s ' + oc.hora + '.');
  vgPintar();
}

function vgFecharOc() {
  const ov = document.getElementById('vgOcOv');
  if (ov) ov.remove();
  VG_OC_TIPO = '';
}

// ==================================================================
// COMPARTILHAR LOCALIZACAO DA VAN
// ------------------------------------------------------------------
// O que o passageiro espera ver e onde a van esta AGORA. O botao antigo
// mandava um link de trajeto do Maps, que nao mostra nada disso.
// A funcao ja existia, escondida num quadro de configuracao.
// ==================================================================
function vgUiLocalizacao() {
  vgFecharMais();
  if (typeof commCompartilharLocal === 'function') return commCompartilharLocal();
  alert('Compartilhamento de localiza\u00e7\u00e3o indispon\u00edvel nesta tela.');
}

// ==================================================================
// TEMA — escolha do motorista, nao do celular
// ------------------------------------------------------------------
// Cada um enxerga melhor de um jeito, e a cabine de dia nao e a mesma
// coisa que a garagem as 4h. 'auto' segue o aparelho, como antes.
// ==================================================================
// O celular passa de mao em mao na garagem: limpa a selecao inteira.
function vgUiTrocarMotorista() {
  vgFecharMais();
  if (typeof resetSelecao === 'function') resetSelecao();
}

function vgUiTema() {
  vgFecharMais();
  const atual = (function () {
    try { return localStorage.getItem('vg_tema') || 'auto'; } catch (e) { return 'auto'; }
  })();
  const opcoes = [
    { id: 'auto',   rotulo: 'Autom\u00e1tico (segue o celular)' },
    { id: 'claro',  rotulo: 'Claro' },
    { id: 'escuro', rotulo: 'Escuro' }
  ];
  const ov = document.createElement('div');
  ov.id = 'vgTemaOv';
  ov.className = 'vg-ov';
  ov.innerHTML = '<div class="vg-ov-caixa">' +
    '<div class="vg-ov-tit">Tema da tela</div>' +
    opcoes.map(o =>
      '<button class="vg-btn vg-btn-motivo' + (o.id === atual ? ' vg-btn-sel' : '') +
      '" onclick="vgUiTemaEscolher(&#39;' + o.id + '&#39;)">' + o.rotulo + '</button>').join('') +
    '<button class="vg-btn vg-btn-cancel" onclick="vgFecharTema()">Fechar</button>' +
    '</div>';
  document.body.appendChild(ov);
}

function vgUiTemaEscolher(modo) {
  vgTema(modo);
  vgFecharTema();
}

function vgFecharTema() {
  const ov = document.getElementById('vgTemaOv');
  if (ov) ov.remove();
}

// ---- tema claro/escuro ----
function vgTema(modo) {
  const m = modo || localStorage.getItem('vg_tema') || 'auto';
  try { localStorage.setItem('vg_tema', m); } catch (e) {}
  const escuro = (m === 'escuro') ||
    (m === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-vg-tema', escuro ? 'escuro' : 'claro');
}


// ==================================================================
// CALENDÁRIO DO TURNO (mesma lógica do gestor)
// O horário do dia = horário gravado + (chegada do dia − chegada padrão).
// ==================================================================
let TURNOS_CAL = [];

const TV_DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const TV_DIAS_NOME = { dom: 'Domingo', seg: 'Segunda', ter: 'Terça', qua: 'Quarta',
                       qui: 'Quinta', sex: 'Sexta', sab: 'Sábado' };

// new Date('2026-08-22') é UTC e no Brasil volta um dia: a rota de sábado
// apareceria na sexta.
function tvData(iso) {
  if (iso instanceof Date) return iso;
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
function tvSemanas(a, b) {
  const x = tvData(a), y = tvData(b);
  if (!x || !y) return null;
  return Math.floor(Math.round((y - x) / 86400000) / 7);
}
function tvHoje() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
         '-' + String(d.getDate()).padStart(2, '0');
}
function tvMin(hhmm) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
  return m ? (+m[1] * 60 + +m[2]) : null;
}
function tvHHMM(min) {
  min = ((Math.round(min) % 1440) + 1440) % 1440;
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}

function tvTurnoNoDia(nome, dataIso) {
  const t = TURNOS_CAL.find(x => x.nome === nome);
  const padrao = (TURNOS_CHEGADA || {})[nome] || '';
  if (!t) return { opera: true, chegada: padrao, saida: '', padrao: padrao, origem: 'legado' };

  const d = tvData(dataIso);
  const chave = d ? TV_DIAS[d.getDay()] : null;
  const regra = chave ? (t.dias || {})[chave] : undefined;

  if (regra === false) {
    return { opera: false, chegada: '', saida: '', padrao: t.chegada || padrao,
             motivo: (TV_DIAS_NOME[chave] || 'Este dia') + ' não tem rota neste turno.' };
  }
  if (t.alternado && chave === t.alternado.dia && t.alternado.desde) {
    const n = tvSemanas(t.alternado.desde, dataIso);
    const passo = Math.max(1, parseInt(t.alternado.semanas, 10) || 2);
    if (n !== null && (n < 0 || (n % passo) !== 0)) {
      return { opera: false, chegada: '', saida: '', padrao: t.chegada || padrao,
               motivo: (TV_DIAS_NOME[chave] || 'Este dia') + ' é alternado e hoje não é a vez desta linha.' };
    }
  }
  const usa = (regra && typeof regra === 'object') ? regra : {};
  return {
    opera: true,
    chegada: usa.chegada || t.chegada || padrao,
    saida: usa.saida || t.saida || '',
    padrao: t.chegada || padrao,
    dia: chave,
    especial: !!(usa.chegada || usa.saida)
  };
}

// Desloca o horário gravado pela diferença entre a chegada do dia e a padrão.
// É a conta que o gestor já faz na mão (1º turno +5h, 2º −4h no sábado),
// só que a partir do cadastro — sem risco de errar o sinal.
function tvHorarioDoDia(horarioGravado, turno, dataIso) {
  const base = tvMin(horarioGravado);
  if (base === null) return { horario: horarioGravado || '', deslocado: false };
  const r = tvTurnoNoDia(turno, dataIso || tvHoje());
  if (!r.opera) return { horario: '', deslocado: false, naoOpera: true, motivo: r.motivo };
  const cd = tvMin(r.chegada), cp = tvMin(r.padrao);
  if (cd === null || cp === null || cd === cp) {
    return { horario: horarioGravado, deslocado: false, chegada: r.chegada };
  }
  return { horario: tvHHMM(base + (cd - cp)), deslocado: true,
           minutos: cd - cp, chegada: r.chegada, original: horarioGravado };
}

async function tvCarregarTurnos(db, docFn, getDocFn) {
  try {
    const snap = await getDocFn(docFn(db, CLIENTE_ID, 'config'));
    if (snap.exists()) {
      const c = snap.data();
      if (c.turnosChegada) Object.assign(TURNOS_CHEGADA, c.turnosChegada);
      if (Array.isArray(c.turnos) && c.turnos.length) TURNOS_CAL = c.turnos;
    }
  } catch (e) { console.warn('turnos:', e && e.message); }
}

const VERTIV_COORDS  = window.CLIENTE_CONFIG.vertiv || window.CLIENTE_CONFIG.destino;

function getDestCoords() {
  const sel = document.getElementById('selLinha');
  const val = sel ? sel.value : '';
  if (val && String(val).startsWith('VERTIV')) return VERTIV_COORDS;
  const r = DATA.find(d => d.id === val);
  if (r && String(r.linha).startsWith('VERTIV')) return VERTIV_COORDS;
  return EMPRESA_COORDS;
}

let DATA = [];  // vazio de proposito: os dados vem do Firestore (ou do cache local). Semente com dados pessoais removida.
let ROTAS_EXTRAS = [];
let useCurrentLocation = true; // Default: use current location
let currentCoords = null;
let seqMode = false;       // sequential navigation mode
let currentSeqRotaId = null;  // temp storage for seq button
let currentSeqStops = [];     // temp storage for seq button
let seqCurrentIdx = 0;     // current stop index
let seqStops = [];         // current route stops
let seqRotaId = null;
let seqAbsent = new Set(); // indices of absent passengers (today only) // { lat, lng } when location is active
let MOTORISTAS = [];  // vazio de proposito: vem do Firestore. Nomes e telefones reais removidos.

// ---- AUTH / SESSÃO ----
const SESSION_KEY = _BASE_LOCAL === 'evamo_v1'
  ? 'evamo_sessao'                       // valor historico da producao
  : _BASE_LOCAL + '_sessao';

function salvarSessao(motorista, linhaId) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ motorista, linhaId })); } catch(e) {}
}

function carregarSessao() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; }
}

function resetSelecao() {
  // Limpa a sessão e volta para a seleção de motorista
  try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
  document.getElementById('selMotorista').value = '';
  document.getElementById('linhaSection').style.display = 'none';
  document.getElementById('rotaContent').innerHTML = '';
  document.getElementById('headerSub').textContent = 'Rota do Dia';
  // A viagem tambem sai de cena: sem isto o "Trocar" parecia nao fazer
  // nada, porque a tela da viagem continuava ocupando tudo.
  try {
    VG_ATUAL = null; VG_ORDEM = [];
    const t = document.getElementById('vgTela'); if (t) t.innerHTML = '';
    vgEsconderAntiga(false);
    vgSeletoresVisiveis(true);
    vgAtualizarCabecalho();
  } catch (e) {}
  trocarAba('rota');
}

async function atualizarApp() {
  const btn = document.getElementById('btnAtualizarApp');
  const txtOrig = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Atualizando...'; }
  try {
    // Rebusca dados do dia do Firebase (rotas publicadas, conclusões, etc.)
    if (typeof carregarRotasHojeFirebase === 'function') { await carregarRotasHojeFirebase(); }
    if (typeof carregarRotasHoje === 'function') { carregarRotasHoje(); }
    // Força recarregar os horários especiais do dia da linha atual
    window._horariosDoDiaCarregado = false;
    // Re-renderiza a rota selecionada (traz selo, presenças e horários atualizados)
    if (typeof loadRota === 'function' && document.getElementById('selLinha') && document.getElementById('selLinha').value) {
      loadRota();
    }
    if (btn) { btn.textContent = 'Atualizado'; setTimeout(() => { btn.textContent = txtOrig; btn.disabled = false; }, 1500); }
  } catch(e) {
    if (btn) { btn.textContent = 'Erro'; setTimeout(() => { btn.textContent = txtOrig; btn.disabled = false; }, 2000); }
    console.warn('atualizarApp:', e);
  }
}

function logout() { resetSelecao(); }

// ---- DATA ----
const FB_CONFIG = window.CLIENTE_CONFIG.fb;

// TRAVA DE IDENTIDADE (proteção multi-cliente)
const CLIENTE_ID = window.CLIENTE_CONFIG.clienteId;
const PROJETO_ESPERADO = window.CLIENTE_CONFIG.projetoEsperado;
let TRAVA_OK = true;
function verificarIdentidade() {
  const real = (FB_CONFIG && FB_CONFIG.projectId) || '';
  if (real !== PROJETO_ESPERADO) {
    TRAVA_OK = false;
    try {
      document.body.innerHTML = '<div style="max-width:560px;margin:80px auto;padding:32px;font-family:sans-serif;background:#1a1208;border:2px solid #f59e0b;border-radius:14px;color:#fff;text-align:center"><div style="font-size:48px;margin-bottom:12px"></div><h2 style="color:#f59e0b">Arquivo no lugar errado</h2><p>Este arquivo é do cliente <b>' + CLIENTE_ID.toUpperCase() + '</b> (projeto <b>' + PROJETO_ESPERADO + '</b>), mas está conectado ao projeto <b>' + real + '</b>.</p><p style="color:#fca5a5">Bloqueado por segurança para NÃO sobrescrever dados de outro cliente.</p></div>';
    } catch(e) {}
    return false;
  }
  return true;
}


async function loadFromStorage() {
  showLoading();
  try {
    // Try Firebase first
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    if (!verificarIdentidade()) return;
    const fbDb = getFirestore(await fbAppMotorista());
    const snap = await getDoc(doc(fbDb, CLIENTE_ID, 'dados'));

    if (snap.exists()) {
      const data = snap.data();
      DATA = data.DATA || [];
      MOTORISTAS = data.MOTORISTAS || [];
      // Cache locally
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
      console.log('Dados carregados do Firebase');
    } else {
      throw new Error('Sem dados no Firebase');
    }
  } catch(e) {
    console.warn('Firebase falhou, tentando localStorage:', e.message);
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const snap = JSON.parse(raw);
        DATA = snap.DATA || [];
        MOTORISTAS = snap.MOTORISTAS || [];
        console.log('Dados carregados do localStorage (cache)');
      } else {
        showNoData('Sem conexão', 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');
        return;
      }
    } catch(e2) {
      showNoData('Erro ao carregar dados.', 'Verifique sua conexão com a internet.');
      return;
    }
  }

  if (DATA.length === 0) {
    showNoData('Sem rotas cadastradas.', 'O gestor ainda não configurou as rotas.');
    return;
  }

  populateMotoristas();

  // Carregar rotas publicadas do dia (roteirizador)
  carregarRotasHojeFirebase();

  // Restaurar sessão anterior automaticamente
  const sessao = carregarSessao();
  if (sessao && sessao.motorista) {
    const sel = document.getElementById('selMotorista');
    sel.value = sessao.motorista;
    if (sel.value === sessao.motorista) {
      loadLinhas(sessao.linhaId); // passa linhaId para restaurar linha também
    }
  }

  // Restaurar estado da busca rápida (aba, query, selecionados)
  restaurarBuscaSessao();
}

function showLoading() {
  document.getElementById('rotaContent').innerHTML = `
    <div style="margin-top:8px;display:flex;flex-direction:column;gap:12px">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 16px">
        <div style="font-family:'Barlow',sans-serif;font-weight:800;font-size:13px;color:var(--accent);letter-spacing:1px;margin-bottom:12px">MINHA ROTA</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#000;font-family:'Barlow',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
            <div style="font-size:13px;color:var(--text);line-height:1.5">Selecione seu <strong>nome</strong> no campo acima</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#000;font-family:'Barlow',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
            <div style="font-size:13px;color:var(--text);line-height:1.5">Selecione a <strong>linha e turno</strong> do momento</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#000;font-family:'Barlow',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
            <div style="font-size:13px;color:var(--text);line-height:1.5">A lista de paradas aparece — toque em <strong>Maps</strong> ou <strong>Waze</strong> em cada parada para navegar</div>
          </div>
        </div>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 16px">
        <div style="font-family:'Barlow',sans-serif;font-weight:800;font-size:13px;color:var(--accent);letter-spacing:1px;margin-bottom:12px">BUSCA RÁPIDA</div>
        <div style="font-size:13px;color:var(--text);line-height:1.6">
          Use a aba <strong>Busca Rápida</strong> para localizar qualquer passageiro pelo nome, bairro ou cidade e navegar direto até ele — ou selecione vários para montar uma rota personalizada.
        </div>
      </div>

      <div style="text-align:center;font-size:11px;color:var(--muted);padding:4px 0">
        ⏳ Conectando ao servidor...
      </div>
    </div>`;
}

function populateMotoristas() {
  const sel = document.getElementById('selMotorista');
  sel.innerHTML = '<option value="">— Selecione o motorista —</option>';
  // So quem tem identidade aparece aqui. Sem telefone nao ha PIN possivel, e
  // oferecer o nome so produz uma tentativa que sempre falha.
  MOTORISTAS.filter(temIdentidade).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.nome;
    opt.textContent = m.nome;
    sel.appendChild(opt);
  });
  // Mesmo seletor de cobertura da aba Rotas de Hoje, agora tambem na Minha Rota
  const selC = document.getElementById('selCoberturaRota');
  if (selC) {
    const atualC = selC.value;
    selC.innerHTML = '<option value="">— ninguém (só as minhas) —</option>';
    MOTORISTAS.forEach(m => {
      const o = document.createElement('option');
      o.value = m.nome;
      o.textContent = m.nome;
      selC.appendChild(o);
    });
    if (atualC) selC.value = atualC;
  }
}

// ============================================================
// PIN DO MOTORISTA
// O PIN e escolhido pelo proprio motorista no primeiro acesso e NUNCA
// e gravado em texto: guardamos so um hash lento (PBKDF2) numa colecao
// separada, cuja LEITURA e negada pelas regras do Firestore.
// A conferencia acontece na propria regra: o app tenta regravar o hash
// que calculou e a gravacao so passa se for igual ao que ja esta la.
// Quem erra o PIN nem consegue escrever, e ninguem consegue ler o hash.
// ============================================================

const PIN_DIGITOS = 6;
const PIN_ITERACOES = 200000;

// Identificador do motorista na colecao de PINs: telefone quando existe,
// senao o nome normalizado (Firestore nao aceita barra no id).
// Identidade exige telefone. Sem ele nao ha id estavel, nao ha PIN e nao ha
// conta na Fase 2. O motorista continua no cadastro operacional e continua
// aparecendo na cobertura — so nao autentica.
function temIdentidade(m) {
  const tel = (m && m.tel) ? String(m.tel).replace(/\D/g, '') : '';
  return tel.length >= 8 && !/^(\d)\1+$/.test(tel);
}

function commPinId(m, nome) {
  const tel = (m && m.tel) ? String(m.tel).replace(/\D/g, '') : '';
  if (tel.length >= 8) return tel;
  return 'nome_' + String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function commAparelhoId() {
  const k = 'temvia_aparelho';
  try {
    let v = localStorage.getItem(k);
    if (!v) { v = 'ap_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, v); }
    return v;
  } catch (e) { return 'ap_sem_storage'; }
}

// A marca do aparelho guarda a VERSAO do acesso, nao um "1" eterno. Quando o
// gestor zera, revoga ou regenera, a versao sobe e a marca deixa de valer.
//
// LIMITE REAL: o gestor nao apaga localStorage de aparelho alheio. A marca
// so e invalidada quando aquele aparelho conseguir consultar pins_ativos —
// ou seja, quando tiver conexao. Sem rede, o aparelho ja reconhecido continua
// entrando ate voltar a se conectar. Isso e consequencia do requisito de o
// motorista funcionar offline, e esta documentado como limitacao.
const commPinChaveLocal = id => 'temvia_pinok_' + CLIENTE_ID + '_' + id;

function commAparelhoReconhecido(id, versaoAtual) {
  try {
    const v = localStorage.getItem(commPinChaveLocal(id));
    if (!v) return false;
    if (versaoAtual == null) return true;      // sem rede: vale o que ha
    return String(v) === String(versaoAtual);
  } catch (e) { return false; }
}

function commMarcarAparelho(id, versao) {
  try { localStorage.setItem(commPinChaveLocal(id), String(versao == null ? 1 : versao)); }
  catch (e) {}
}

// Hash lento: mesmo que alguem obtenha o valor, testar os 10 mil PINs sai caro.
async function commPinHash(id, pin) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode('temvia:' + CLIENTE_ID + ':' + id), iterations: PIN_ITERACOES, hash: 'SHA-256' },
    chave, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Lista publica de quem JA tem PIN. Serve so para a tela saber se pede ou cria;
// nao guarda segredo nenhum e nao decide acesso.
// Estado do acesso, lido de pins_ativos. O documento com o hash tem
// `allow read: if false` — ninguem le o hash, nem o proprio dono. Por isso o
// que a tela precisa saber (existe? e provisorio? expirou? qual a versao?)
// mora aqui, sem segredo nenhum.
//
// Devolve { existe, prov, exp, v } ou null quando nao deu para consultar —
// nao confundir "nao sei" com "nao tem". Ver TRANSICAO_CHAT §4.
async function commAcessoMeta(id) {
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'pins_ativos'));
    if (!snap.exists()) return { existe: false, prov: false, exp: null, v: 1 };
    const d = snap.data();
    const lista = d.lista || [];
    const meta = (d.meta || {})[id] || null;
    const existe = lista.indexOf(id) > -1 || !!meta;
    return {
      existe: existe,
      prov: !!(meta && meta.prov),
      exp: (meta && meta.exp) || null,
      v: (meta && meta.v) || 1
    };
  } catch (e) { return null; }
}

function commProvisorioExpirado(meta) {
  if (!meta || !meta.prov || !meta.exp) return false;
  const t = new Date(meta.exp).getTime();
  return !isNaN(t) && Date.now() > t;
}

async function commPinMarcarAtivo(id) {
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'pins_ativos');
    const snap = await getDoc(ref);
    const lista = snap.exists() ? (snap.data().lista || []) : [];
    if (lista.indexOf(id) === -1) lista.push(id);
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
  } catch (e) {}
}

// Confere sem ler: regrava o hash calculado. A regra recusa se nao bater.
async function commPinConferir(id, hash) {
  const db = await commGetDb();
  const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  await updateDoc(doc(db, CLIENTE_ID + '_pins', id), {
    hash: hash,
    ultimoAcesso: new Date().toISOString(),
    aparelhos: arrayUnion(commAparelhoId())
  });
}

// commPinCriar foi REMOVIDA de proposito. Criar o primeiro acesso e acao
// exclusiva do gestor ("Ativar acesso"), e a regra do Firestore recusa
// `create` de quem nao for conta real. Enquanto isso existia aqui, qualquer
// pessoa criava o PIN de um colega que ainda nao tinha — e ficava sabendo.

// Troca do provisorio pelo definitivo. So o dono consegue, porque precisa
// PROVAR que conhece o hash atual: a regra confere `provaAnterior` contra o
// hash gravado antes de aceitar o novo.
// Tira o `prov` do pins_ativos. Sem isto o app continua achando que o acesso
// e provisorio e pede o codigo do gestor para sempre.
async function commMarcarDefinitivo(id) {
  const db = await commGetDb();
  const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const ref = doc(db, CLIENTE_ID, 'pins_ativos');
  const snap = await getDoc(ref);
  const d = snap.exists() ? snap.data() : {};
  const lista = d.lista || [];
  const meta = d.meta || {};
  const atual = meta[id] || { v: 1 };
  // A versao NAO sobe: subir aqui invalidaria a marca de aparelho que este
  // mesmo acesso acabou de conquistar.
  meta[id] = { v: atual.v || 1, prov: false, exp: null };
  if (lista.indexOf(id) === -1) lista.push(id);
  await setDoc(ref, { lista, meta, updatedAt: new Date().toISOString() });
}

async function commPinTrocar(id, hashAtual, hashNovo) {
  const db = await commGetDb();
  const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const ref = doc(db, CLIENTE_ID + '_pins', id);
  await updateDoc(ref, {
    provaAnterior: hashAtual,
    hash: hashNovo,
    provisorio: false,
    trocadoEm: new Date().toISOString(),
    ultimoAcesso: new Date().toISOString(),
    aparelhos: arrayUnion(commAparelhoId())
  });
  // As duas pontas precisam concordar, senao o app pede o provisorio de novo.
  await commMarcarDefinitivo(id);

  // Terceira escrita, sem mexer no hash: apaga a prova. Se falhar, o que fica
  // guardado e o hash de um PIN provisorio ja morto.
  try {
    const { deleteField } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    await updateDoc(ref, { provaAnterior: deleteField() });
  } catch (e) {}
}

// Teclado numerico proprio: prompt() abre teclado de letras no celular.
function commPinTela(titulo, subtitulo, confirmar) {
  return new Promise(resolve => {
    const fundo = document.createElement('div');
    fundo.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(8,10,14,0.96);display:flex;align-items:center;justify-content:center;padding:20px';
    fundo.innerHTML =
      '<div style="width:100%;max-width:340px;background:#171a21;border:1px solid #262b36;border-radius:16px;padding:24px">' +
        '<div style="font-family:Barlow,sans-serif;font-weight:800;font-size:19px;color:#f59e0b;margin-bottom:6px">' + titulo + '</div>' +
        '<div style="font-size:13px;color:#8a90a0;margin-bottom:18px;line-height:1.4">' + subtitulo + '</div>' +
        '<input id="pinA" type="password" inputmode="numeric" autocomplete="off" maxlength="' + PIN_DIGITOS + '" placeholder="' + '\u2022'.repeat(PIN_DIGITOS) + '" ' +
          'style="width:100%;background:#0f1115;border:1px solid #262b36;border-radius:10px;padding:14px;color:#f5f5f5;font-size:24px;text-align:center;letter-spacing:10px;margin-bottom:10px">' +
        (confirmar ? '<input id="pinB" type="password" inputmode="numeric" autocomplete="off" maxlength="' + PIN_DIGITOS + '" placeholder="repita" ' +
          'style="width:100%;background:#0f1115;border:1px solid #262b36;border-radius:10px;padding:14px;color:#f5f5f5;font-size:24px;text-align:center;letter-spacing:10px;margin-bottom:10px">' : '') +
        '<div id="pinErro" style="min-height:18px;font-size:12px;color:#ef4444;margin-bottom:8px"></div>' +
        '<button id="pinOk" style="width:100%;background:#f59e0b;color:#000;border:none;border-radius:10px;padding:13px;font-weight:800;font-size:15px;font-family:Barlow,sans-serif;cursor:pointer">Confirmar</button>' +
        '<button id="pinCancelar" style="width:100%;background:none;color:#8a90a0;border:none;padding:12px;font-size:13px;cursor:pointer">Cancelar</button>' +
      '</div>';
    document.body.appendChild(fundo);
    const a = fundo.querySelector('#pinA'), bb = fundo.querySelector('#pinB');
    const erro = fundo.querySelector('#pinErro'), ok = fundo.querySelector('#pinOk');
    const soDig = e => { e.target.value = e.target.value.replace(/\D/g, ''); };
    a.addEventListener('input', soDig); if (bb) bb.addEventListener('input', soDig);
    const fechar = v => { try { document.body.removeChild(fundo); } catch (e) {} resolve(v); };
    ok.onclick = () => {
      const v1 = a.value.trim();
      if (v1.length !== PIN_DIGITOS) { erro.textContent = 'O PIN tem ' + PIN_DIGITOS + ' digitos.'; return; }
      if (bb && bb.value.trim() !== v1) { erro.textContent = 'Os dois campos estao diferentes.'; return; }
      fechar(v1);
    };
    fundo.querySelector('#pinCancelar').onclick = () => fechar(null);
    [a, bb].forEach(c => { if (c) c.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ok.click(); } }); });
    setTimeout(() => a.focus(), 100);
  });
}

// Caixa de aviso simples. NAO pode reusar a tela do PIN: ela exige 4 digitos
// para fechar, e o motorista que errasse o PIN ficaria preso nela.
function commPinAviso(texto) {
  return new Promise(resolve => {
    const fundo = document.createElement('div');
    fundo.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(8,10,14,0.96);display:flex;align-items:center;justify-content:center;padding:20px';
    fundo.innerHTML =
      '<div style="width:100%;max-width:340px;background:#171a21;border:1px solid #262b36;border-radius:16px;padding:24px">' +
        '<div style="font-size:14px;color:#f5f5f5;line-height:1.5;margin-bottom:18px">' + texto + '</div>' +
        '<button id="avisoOk" style="width:100%;background:#f59e0b;color:#000;border:none;border-radius:10px;padding:13px;font-weight:800;font-size:15px;font-family:Barlow,sans-serif;cursor:pointer">Entendi</button>' +
      '</div>';
    document.body.appendChild(fundo);
    fundo.querySelector('#avisoOk').onclick = () => {
      try { document.body.removeChild(fundo); } catch (e) {}
      resolve(null);
    };
  });
}

async function commVerificarPin(nome) {
  const m = MOTORISTAS.find(x => x.nome === nome);
  const id = commPinId(m, nome);

  // Sem telefone valido nao ha identidade. Antes isto devolvia `true` e a
  // pessoa entrava sem PIN nenhum — foi assim que "A DEFINIR" virou porta
  // aberta para toda a operacao pela cobertura.
  if (!id || id.indexOf('nome_') === 0) {
    await commPinAviso('Este motorista nao tem telefone cadastrado, entao nao ' +
      'tem acesso ao app. Peca ao gestor da transportadora para completar o cadastro.');
    return false;
  }

  const meta = await commAcessoMeta(id);

  // Nao deu para consultar: se o aparelho ja era reconhecido, entra (o app
  // precisa funcionar sem sinal). Se nao era, nao inventa resposta.
  if (meta === null) {
    if (commAparelhoReconhecido(id, null)) return true;
    await commPinAviso('Nao foi possivel verificar seu acesso agora. ' +
      'Verifique sua conexao e tente novamente.');
    return false;
  }

  if (!meta.existe) {
    await commPinAviso('PIN ainda nao ativado. Solicite ao gestor da ' +
      'transportadora a ativacao do seu acesso.');
    return false;
  }

  if (commProvisorioExpirado(meta)) {
    await commPinAviso('O acesso provisorio expirou. Peca ao gestor para gerar outro.');
    return false;
  }

  // Provisorio NUNCA usa reconhecimento de aparelho: ele existe justamente
  // para ser trocado por quem recebeu o codigo.
  if (!meta.prov && commAparelhoReconhecido(id, meta.v)) return true;

  const titulo = meta.prov ? 'Primeiro acesso' : 'Ola, ' + nome;
  const sub = meta.prov
    ? 'Digite o PIN provisorio de ' + PIN_DIGITOS + ' digitos que o gestor lhe passou.'
    : 'Digite seu PIN de ' + PIN_DIGITOS + ' digitos para continuar.';
  const pin = await commPinTela(titulo, sub, false);
  if (pin === null) return false;

  let hash;
  try { hash = await commPinHash(id, pin); }
  catch (e) { alert('Nao foi possivel validar o PIN neste navegador. Fale com o gestor.'); return false; }

  try {
    await commPinConferir(id, hash);
  } catch (e) {
    await commPinAviso(meta.prov
      ? 'PIN provisorio incorreto. Confira com o gestor.'
      : 'PIN incorreto. Se esqueceu, peca ao gestor para zerar o seu.');
    return false;
  }

  // Acertou. Se era provisorio, so entra depois de definir o definitivo.
  if (meta.prov) {
    const novo = await commPinTela('Crie o seu PIN',
      'O provisorio deixa de valer agora. Escolha um PIN de ' + PIN_DIGITOS +
      ' digitos que so voce saiba.', true);
    if (novo === null) return false;
    if (novo === pin) {
      await commPinAviso('O PIN novo precisa ser diferente do provisorio.');
      return false;
    }
    let hashNovo;
    try { hashNovo = await commPinHash(id, novo); }
    catch (e) { alert('Nao foi possivel gravar o PIN neste navegador.'); return false; }
    try { await commPinTrocar(id, hash, hashNovo); }
    catch (e) {
      // Permissao e conexao sao coisas diferentes. Dizer "tente com conexao"
      // quando a regra recusou manda o motorista procurar sinal na rua.
      const msg = String((e && (e.code || e.message)) || '');
      await commPinAviso(/permission|insufficient/i.test(msg)
        ? 'Seu acesso ainda nao esta liberado para trocar o PIN. Fale com o gestor da transportadora.'
        : 'Nao foi possivel gravar seu PIN agora. Verifique sua conexao e tente de novo.');
      return false;
    }
  }

  commMarcarAparelho(id, meta.v);
  return true;
}

async function loadLinhas(restoreLinhaId) {
  const nome = document.getElementById('selMotorista').value;
  const linhaSection = document.getElementById('linhaSection');
  const sel = document.getElementById('selLinha');
  document.getElementById('rotaContent').innerHTML = '';

  const avisoDiv = document.getElementById('coberturaAvisoRota');
  if (avisoDiv) avisoDiv.innerHTML = '';

  if (!nome) { linhaSection.style.display = 'none'; return; }
  if (!(await commVerificarPin(nome))) { document.getElementById('selMotorista').value = ''; linhaSection.style.display = 'none'; return; }

  // Cobertura: ver as linhas de um colega (sem o PIN dele; a identidade continua sendo a sua)
  const cobertura = (document.getElementById('selCoberturaRota') || {}).value || '';
  const nomeVer = cobertura || nome;
  if (avisoDiv && cobertura && cobertura !== nome) {
    avisoDiv.innerHTML = '<div class="vg-cobertura">' +
      '<strong>Modo cobertura:</strong> voc\u00ea (' + esc(nome) + ') est\u00e1 vendo as linhas de <strong>' +
      esc(cobertura) + '</strong>.</div>';
  }

  // Salvar motorista na sessão
  salvarSessao(nome, carregarSessao()?.linhaId || '');

  sel.innerHTML = '<option value="">— Selecione uma linha —</option>';
  DATA.forEach(rota => {
    if (rota.motorista !== nomeVer && rota.motoristaSaida !== nomeVer) return;
    const ativos = rota.passageiros.filter(p => p.status === 'ativo').length;
    if (ativos === 0) return;
    const chegada = CHEGADAS[rota.turno] || '';
    const opt = document.createElement('option');
    opt.value = rota.id;
    opt.textContent = 'Linha ' + rota.linha + ' · ' + rota.turno + ' Turno · chegada ' + chegada;
    sel.appendChild(opt);
  });

  // Add extra routes assigned to this motorista
  ROTAS_EXTRAS.forEach(re => {
    if (re.motorista !== nomeVer) return;
    const opt = document.createElement('option');
    opt.value = re.id;
    opt.textContent = '' + re.nome + ' · ' + re.data + ' · ' + (re.horario||'--:--') + ' · ' + re.passageiros.length + ' pass.';
    opt.style.color = '#ec4899';
    sel.appendChild(opt);
  });

  linhaSection.style.display = 'block';

  // Restaurar linha da sessão anterior
  if (restoreLinhaId) {
    sel.value = restoreLinhaId;
    if (sel.value === restoreLinhaId) {
      loadRota(); // carrega rota automaticamente
    }
  }
}


function loadRotaExtra(re) {
  seqMode = false; seqCurrentIdx = 0;
  const sorted = [...re.passageiros].sort((a,b) => (a.horario||'99:99').localeCompare(b.horario||'99:99'));
  const content = document.getElementById('rotaContent');
  let html = '';

  // Extra route badge
  html += '<div style="background:rgba(236,72,153,0.1);border:1px solid rgba(236,72,153,0.4);border-radius:12px;padding:12px 16px;margin-bottom:14px;text-align:center">';
  html += '<div style="font-size:11px;color:#ec4899;text-transform:uppercase;letter-spacing:1px;font-weight:700">Rota Extra</div>';
  html += '<div style="font-weight:800;font-size:18px;margin:4px 0">' + esc(re.nome) + '</div>';
  html += '<div style="font-size:12px;color:var(--muted)">' + esc(re.data) + ' · Saída: ' + (re.horario||'--:--') + '</div>';
  html += '</div>';

  // Stops list
  html += '<div class="stops-list">';
  sorted.forEach((p, i) => {
    const wazeUrl = buildWazeUrl(p.lat, p.lng, p.embarque||p.endereco, p.cidade);
    const mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + (p.lat&&p.lng ? p.lat+','+p.lng : encodeURIComponent((p.embarque||p.endereco||'')+', '+(p.cidade||'Sorocaba')+' SP')) + '&travelmode=driving';
    html += '<div class="stop-card">';
    html += '<div class="stop-num">' + (i+1) + '</div>';
    html += '<div class="stop-info">';
    html += '<div class="stop-name">' + esc(p.nome) + '</div>';
    if (p.telefone) html += '<div class="stop-tel">' + p.telefone + '</div>';
    html += '<div class="stop-addr">' + esc(p.embarque||p.endereco||'—') + '</div>';
    html += '<div class="stop-nav-row">';
    html += '<a href="' + mapsUrl + '" target="_blank" class="stop-nav-maps">Maps</a>';
    html += '<a href="' + wazeUrl + '" target="_blank" class="stop-nav-waze">Waze</a>';
    html += '</div></div></div>';
  });
  html += '</div>';
  content.innerHTML = html;
}

function loadRota() {
  const rotaId = document.getElementById('selLinha').value;
  const motorista = document.getElementById('selMotorista').value;
  const content = document.getElementById('rotaContent');
  if (!rotaId) { content.innerHTML = ''; return; }

  // Salvar sessão completa (motorista + linha)
  salvarSessao(motorista, rotaId);

  // Check if it's an extra route
  if (rotaId.startsWith('extra-')) {
    const re = ROTAS_EXTRAS.find(r => r.id === rotaId);
    if (!re) { content.innerHTML = ''; return; }
    loadRotaExtra(re);
    return;
  }

  const rota = DATA.find(r => r.id === rotaId);
  if (!rota) return;

  // Prepara a viagem do dia para esta linha e pinta o cartao de proximo
  // embarque. Sem isto a tela nova ficava sempre vazia.
  try { vgPreparar(rota); } catch (e) { console.warn('viagem:', e && e.message); }

  // Carregar horários recalculados do dia (uma vez por seleção) e re-renderizar
  if (!window._horariosDoDiaCarregado || window._horariosDoDiaPara !== rotaId) {
    window._horariosDoDiaPara = rotaId;
    commCarregarHorariosDoDia(rotaId);
  }

  const chegada = CHEGADAS[rota.turno] || '';
  const mObj = MOTORISTAS.find(m => m.nome === rota.motorista);
  const mObjS = rota.motoristaSaida ? MOTORISTAS.find(m => m.nome === rota.motoristaSaida) : null;

  let sorted = rota.passageiros
    .filter(p => p.status === 'ativo')
    .sort((a,b) => (a.horario||'99:99').localeCompare(b.horario||'99:99'));

  // Se houver recálculo publicado para hoje, aplicar: remove ausentes e usa horários ajustados
  const chaveLinha = String(rota.linha) + '_' + rota.turno;
  const recalc = (window._horariosDoDia || []).find(x => x.chave === chaveLinha);
  let usandoRecalc = false;
  if (recalc && recalc.paradas && recalc.paradas.length) {
    usandoRecalc = true;
    // monta sorted a partir das paradas recalculadas (já vêm na ordem certa e sem ausentes)
    sorted = recalc.paradas.map(par => {
      const orig = rota.passageiros.find(p => (p.telefone||'').replace(/\D/g,'') === (par.telefone||'').replace(/\D/g,'')) || {};
      return Object.assign({}, orig, { nome: par.nome, telefone: par.telefone, embarque: par.embarque || orig.embarque, bairro: par.bairro || orig.bairro, lat: par.lat || orig.lat, lng: par.lng || orig.lng, horario: par.horarioNovo, _horarioOrig: par.horarioOrig });
    });
  }

  const mapsUrl = buildMapsUrl(sorted);

  let html = '';

  // Summary chips
  html += '<div class="chips">';
  html += '<span class="chip chip-turno">⏰ ' + rota.turno + ' Turno</span>';
  html += '<span class="chip chip-pass">' + sorted.length + ' passageiros</span>';
  html += '<span class="chip chip-vei">' + rota.veiculo + '</span>';
  html += '</div>';

  // Motorista card
  if (mObj) {
    html += '<div class="card">';
    html += '<div class="card-title">Motorista responsável</div>';
    html += '<div class="moto-name">' + mObj.nome + '</div>';
    if (mObj.tel) html += '<div class="moto-tel">' + mObj.tel + '</div>';
    if (mObjS) {
      html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">';
      html += '<div style="font-size:11px;color:var(--muted)">Motorista de Saída: <strong style="color:var(--text)">' + mObjS.nome + '</strong>';
      if (mObjS.tel) html += ' · <span style="color:var(--accent2)">' + mObjS.tel + '</span>';
      html += '</div></div>';
    }
    html += '</div>';
  }

  // Build Waze URL (first stop from garagem)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Botão Google Maps do topo — só desktop (no mobile não funciona bem com muitas paradas)
  if (!isMobile) {
    window._rotaDesktopSorted = sorted;
    html += '<button onclick="openMaps(window._rotaDesktopSorted)" class="nav-maps-btn" style="display:flex;margin-bottom:16px">';
    html += '<span style="font-size:20px"></span> Abrir Rota Completa no Google Maps';
    html += '</button>';
  } else {
    window._rotaDesktopSorted = sorted;
  }

  // ===== PAINEL DE COMUNICAÇÃO COM PASSAGEIROS =====
  const chaveComm = String(rota.linha) + '_' + rota.turno;
  window._commChave = chaveComm;
  window._commLinha = rota.linha;
  window._commTurno = rota.turno;
  // Avisos da linha: buscados aqui porque so agora se sabe qual e a linha.
  try { vgAvisosBuscar(); } catch (e) {}
  html += '<div class="card" style="border-color:rgba(16,185,129,0.3)">';
  html += '<div class="card-title" style="color:var(--green)">Comunicação com passageiros</div>';
  // Presenças
  html += '<div id="commPresencas" style="margin-bottom:10px"></div>';
  // Chat
  html += '<button onclick="commToggleChat()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:11px;font-weight:700;font-family:Barlow;font-size:13px;cursor:pointer">Abrir chat da linha <span id="commChatBadge" style="display:none;background:var(--red);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:6px">novo</span></button>';
  html += '<div id="commChatBox" style="display:none;margin-top:10px"></div>';
  html += '</div>';


  html += '<div class="garagem-card">';
  html += '<div style="font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Ponto de Partida</div>';
  html += '<div style="font-weight:600">Localização Atual</div>';
  html += '<div style="font-size:12px;color:var(--muted);margin-top:3px">Use os botões Maps em cada parada para navegar</div>';
  
  html += '</div>';

  // Stops
  html += '<div class="card">';
  html += '<div class="card-title">Paradas de Embarque' + (usandoRecalc ? ' <span style="font-size:11px;color:var(--accent);font-weight:700">· ajustada hoje</span>' : '') + '</div>';
  if (usandoRecalc) html += '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Lista do dia: sem quem avisou que não vai, com horários recalculados.</div>';

  sorted.forEach((p, i) => {
    const addr = p.embarque || p.endereco || '—';
    const nome = esc(p.nome);
    const addrSafe = esc(addr);
    const coordLink = p.lat && p.lng
      ? 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng
      : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr + ', ' + (p.cidade||'Sorocaba') + ' SP');
    const telDig = (p.telefone||'').replace(/\D/g,'');
    const telLink = telDig ? ('https://wa.me/55' + telDig) : '';
    const horaMudou = p._horarioOrig && p._horarioOrig !== p.horario;

    html += '<div class="stop">';
    html += '<div class="stop-num">' + (i+1) + '</div>';
    html += '<div class="stop-time">' + (p.horario||'--:--');
    if (horaMudou) html += '<div style="font-size:9px;color:var(--muted);text-decoration:line-through;font-weight:400">' + p._horarioOrig + '</div>';
    html += '</div>';
    html += '<div class="stop-info">';
    html += '<div class="stop-name">' + nome + '</div>';
    if (p.telefone) html += '<a href="' + telLink + '" target="_blank" class="stop-tel" style="text-decoration:none;display:inline-block">' + p.telefone + '</a>';
    html += '<div class="stop-addr">' + addrSafe;
    if (p.bairro) html += ' · ' + p.bairro;
    html += '</div>';
    html += '<div>' + commSeloPresenca(p.telefone) + '</div>';
    const wazeStopUrl = buildWazeUrl(p.lat, p.lng, p.embarque || p.endereco, p.cidade);
    html += '<div class="stop-nav-row">';
    html += '<a href="' + coordLink + '" target="_blank" class="stop-nav-maps">Google Maps</a>';
    html += '<a href="' + wazeStopUrl + '" target="_blank" class="stop-nav-waze">Waze</a>';
    html += '</div>';
    html += '</div></div>';
  });

  html += '</div>';

  // Destination
  html += '<div class="dest-card">';
  html += '<div style="font-size:11px;color:var(--accent2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Destino Final</div>';
  html += '<div class="dest-time">' + chegada + '</div>';
  html += '<div class="dest-label">Chegada prevista na empresa</div>';
  const destCoords2 = (rota && String(rota.linha).startsWith('VERTIV')) ? VERTIV_COORDS : EMPRESA_COORDS;
  const destLabel   = (rota && String(rota.linha).startsWith('VERTIV')) ? 'Vertiv — Estr. dos Carvalhos, 1441' : 'Av. Jerome Case, 2600 — Éden, Sorocaba-SP';
  html += '<div class="dest-addr">' + destLabel + '</div>';
  html += '<div class="stop-nav-row" style="margin-top:8px">';
  html += '<a href="https://www.google.com/maps/search/?api=1&query=' + EMPRESA_COORDS.lat + ',' + EMPRESA_COORDS.lng + '" target="_blank" class="stop-nav-maps">Google Maps</a>';
  html += '<a href="' + buildWazeUrl(EMPRESA_COORDS.lat, EMPRESA_COORDS.lng, null, null) + '" target="_blank" class="stop-nav-waze">Waze</a>';
  html += '</div>';
  html += '</div>';

  // ===== QUADRO: HORARIO ESPECIAL DO DIA (movido para o final) =====
  html += '<div class="card" style="border-color:rgba(245,158,11,0.3)">';
  html += '<div class="card-title" style="color:var(--accent)">\u26A0\uFE0F Hor\u00e1rio especial do dia</div>';
  html += '<label style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;font-size:13px">' +
    '<input type="checkbox" id="commSabado" onchange="document.getElementById(\'commSabadoHora\').disabled=!this.checked" style="width:18px;height:18px;accent-color:var(--accent)">' +
    '<span>\uD83D\uDCC5 <strong>Hor\u00e1rio especial do dia</strong> — chegada \u00e0s</span>' +
    '<input type="time" id="commSabadoHora" value="10:45" disabled style="margin-left:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 8px;color:var(--text);font-size:14px;font-family:Barlow">' +
    '</label>';
  html += '<label style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;font-size:13px">' +
    '<span>\u23F1\uFE0F <strong>Folga de seguran\u00e7a</strong> (min)</span>' +
    '<input type="number" id="commFolga" value="5" min="0" max="60" style="margin-left:auto;width:70px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 8px;color:var(--text);font-size:14px;font-family:Barlow;text-align:center">' +
    '</label>';
  html += '<button onclick="commRecalcular()" style="width:100%;background:linear-gradient(135deg,var(--accent),#d97706);color:#000;border:none;border-radius:10px;padding:12px;font-weight:800;font-family:Barlow;font-size:14px;cursor:pointer;margin-bottom:8px">\uD83D\uDD04 Recalcular hor\u00e1rios de hoje</button>';
  html += '<div id="commRecalcStatus" style="font-size:12px;color:var(--muted);text-align:center"></div>';
  html += '</div>';

  // ===== QUADRO: COMPARTILHAR LOCALIZACAO (movido para o final) =====
  html += '<div class="card" style="border-color:rgba(59,130,246,0.3)">';
  html += '<div class="card-title" style="color:var(--accent2)">\uD83D\uDCCD Localiza\u00e7\u00e3o da van</div>';
  html += '<label style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:4px;font-size:13px">' +
    '<span>\uD83D\uDCC5 <strong>Data da viagem</strong></span>' +
    '<input type="date" id="commDataViagem" style="margin-left:auto;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 8px;color:var(--text);font-size:14px;font-family:Barlow">' +
    '</label>';
  html += '<div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-align:center">Para qual dia \u00e9 esta localiza\u00e7\u00e3o.</div>';
  html += '<button id="btnCompartLoc" onclick="commCompartilharLocal()" style="width:100%;background:var(--accent2);color:#fff;border:none;border-radius:10px;padding:12px;font-weight:700;font-family:Barlow;font-size:14px;cursor:pointer;margin-bottom:8px">\uD83D\uDCCD Compartilhar localiza\u00e7\u00e3o da van</button>';
  html += '<button id="btnPararCompart" onclick="commPararCompartilhar()" style="display:none;width:100%;background:var(--red);color:#fff;border:none;border-radius:10px;padding:12px;font-weight:700;font-family:Barlow;font-size:14px;cursor:pointer;margin-bottom:8px">\u23F9\uFE0F Parar de compartilhar</button>';
  html += '<div id="commLocalStatus" style="font-size:12px;color:var(--muted);text-align:center"></div>';
  // Sugerir a data da proxima viagem (mesma logica de rodada) no campo
  setTimeout(() => {
    const _d = document.getElementById('commDataViagem');
    if (_d && !_d.value && window._commTurno) _d.value = commRodada(window._commTurno);
  }, 0);
  // GPS ao vivo: escondido (nao funciona com app em segundo plano). Mantido no DOM oculto para nao quebrar refs.
  html += '<button id="btnGpsVivo" onclick="commGpsToggle()" style="display:none">GPS</button>';
  html += '<div id="commGpsStatus" style="display:none"></div>';
  html += '<button id="btnMapaRota" onclick="commToggleMapaRota()" style="display:none">mapa</button>';
  html += '<div id="commMapaWrap" style="display:none"><div id="commMapa"></div></div>';
  html += '</div>';

  content.innerHTML = html;
  if (window._commChave) commIniciar(window._commChave);
}

// ===== COMUNICAÇÃO COM PASSAGEIROS (Firebase realtime) =====
let _commUnsubPres = null, _commUnsubChat = null, _commUnsubTrack = null, _commUnsubFer = null;
let _commChatVisto = 0, _commChatAberto = false, _commDb = null;
let _commMapsLoaded = false;

function commRodada(turno) {
  const agora = new Date();
  // Corte por turno (deve ficar IGUAL ao rodadaAtual() do app do passageiro,
  // senao motorista e passageiro calculam rodadas diferentes e a localizacao/chat nao casam).
  // ADM encerra a jornada as 17:40, por isso usa hora:minuto.
  const limites = { '1°': '12:00', '2°': '20:00', '3°': '23:00', 'ADM': '17:40' };
  const lim = limites[turno] || '23:00';
  const [hLim, mLim] = lim.split(':').map(Number);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  if (minutosAgora >= hLim * 60 + mLim) return hojeLocal(agora, 1);
  return hojeLocal(agora);
}
function commChatDocId(chave) { return 'chat_' + chave.replace('°','').replace(/[^a-zA-Z0-9_]/g,''); }

// ---------------------------------------------------------------------------
// UMA instancia do Firebase para o app inteiro.
// Antes, cada operacao abria uma instancia nova com nome carimbado pela hora
// ('rotasHoje-1755...'), e nenhuma era destruida. Alem do vazamento, isso
// faria o App Check disparar uma avaliacao do reCAPTCHA por operacao.
// ---------------------------------------------------------------------------
const FB_APP_NOME_MOT = 'motorista-' + CLIENTE_ID;
let _fbAppMot = null;

async function fbAppMotorista() {
  if (_fbAppMot) return _fbAppMot;
  const { initializeApp, getApps } = await import(
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  _fbAppMot = getApps().find(a => a.name === FB_APP_NOME_MOT)
           || initializeApp(FB_CONFIG, FB_APP_NOME_MOT);
  // App Check e sessao, nesta ordem, antes de qualquer acesso ao Firestore.
  // Sem sessao o Firestore recusa tudo — e no PIN a recusa vira
  // "voce ja tem um PIN cadastrado", que e mentira.
  if (window.temviaComum) await window.temviaComum.prepararFirebase(_fbAppMot);
  return _fbAppMot;
}

async function commGetDb() {
  if (_commDb) return _commDb;
  const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  if (!verificarIdentidade()) return;
  _commDb = getFirestore(await fbAppMotorista());
  return _commDb;
}

// Le a operacao atendida do mesmo documento que o gestor grava
// (config.empresa.operacaoNome) e monta o topo igual ao dele.
// Sem rede, fica o nome da casca — melhor que topo vazio.
async function vgIdentidade() {
  const amb = document.getElementById('headerAmb');
  const sub = document.getElementById('headerSub');
  if (amb && C.ambienteTeste) amb.style.display = '';
  let nome = '';
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'config'));
    if (snap.exists()) {
      const c = snap.data();
      nome = (c.empresa && c.empresa.operacaoNome) || c.operacaoNome || '';
    }
  } catch (e) { /* sem rede: cai no nome da casca */ }
  if (sub) sub.textContent = nome ? ('Atendendo ' + nome) : (C.marca || 'Rota do Dia');
}

async function commCarregarTurnos() {
  // Le os horarios de chegada por turno dos Dados da Empresa (config) e atualiza TURNOS_CHEGADA.
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'config'));
    if (snap.exists() && snap.data().turnosChegada) {
      Object.assign(TURNOS_CHEGADA, snap.data().turnosChegada);
      if (Array.isArray(snap.data().turnos) && snap.data().turnos.length)
        TURNOS_CAL = snap.data().turnos;
    }
  } catch(e) { console.warn('commCarregarTurnos:', e); }
  // Agora o calendario existe: a viagem de VOLTA so pode ser montada
  // aqui, porque o horario de saida do turno vem deste documento.
  // vgPreparar recupera a viagem ja em andamento, entao repetir e seguro.
  try { if (VG_ROTA) vgPreparar(VG_ROTA); } catch (e) {}
}

async function commIniciar(chave) {
  // limpar listeners anteriores
  if (_commUnsubPres) { _commUnsubPres(); _commUnsubPres = null; }
  if (_commUnsubChat) { _commUnsubChat(); _commUnsubChat = null; }
  if (_commUnsubTrack) { _commUnsubTrack(); _commUnsubTrack = null; }
  if (_commUnsubFer) { _commUnsubFer(); _commUnsubFer = null; }
  _commChatVisto = 0; _commChatAberto = false;
  try {
    const db = await commGetDb();
    const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    await commCarregarTurnos();
    const turno = window._commTurno;
    const rodada = commRodada(turno);

    // Presenças + Férias combinados
    let _commFerias = [];
    _commUnsubFer = onSnapshot(doc(db, CLIENTE_ID, 'ferias'), (snapF) => {
      const allF = (snapF.exists() && snapF.data().lista) ? snapF.data().lista : [];
      const hoje = hojeLocal();
      _commFerias = allF.filter(f => f.chave === chave && f.inicio <= hoje && f.fim >= hoje);
      // re-render presenças com a info de férias atual
      if (window._commUltimaPres) commRenderPresencas(window._commUltimaPres, _commFerias);
    });

    _commUnsubPres = onSnapshot(doc(db, CLIENTE_ID, 'presencas'), (snap) => {
      const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
      const mine = all.filter(p => p.chave === chave && p.rodada === rodada);
      window._commUltimaPres = mine;
      commRenderPresencas(mine, _commFerias);
    });

    // Rastreador (status do meu compartilhamento)
    _commUnsubTrack = onSnapshot(doc(db, CLIENTE_ID, 'rastreador'), (snap) => {
      const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
      const meu = all.find(t => t.chave === chave && t.rodada === rodada);
      const el = document.getElementById('commLocalStatus');
      const ativo = !!(meu && meu.link);
      if (el) el.textContent = ativo ? 'Localização compartilhada com os passageiros' : '';
      commAtualizarBotoesLoc(ativo);
    });

    // Chat
    _commUnsubChat = onSnapshot(doc(db, CLIENTE_ID, commChatDocId(chave)), (snap) => {
      const msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
      if (_commChatAberto) commRenderChat(msgs);
      const badge = document.getElementById('commChatBadge');
      if (badge && !_commChatAberto && msgs.length > _commChatVisto && _commChatVisto > 0) badge.style.display = 'inline';
      _commChatVisto = msgs.length;
    });
  } catch(e) { console.warn('comm:', e); }
}

function commSeloPresenca(telefone) {
  const pres = window._commUltimaPres || [];
  const tel = (telefone||'').replace(/\D/g,'');
  if (!tel) return '';
  const m = pres.find(x => (x.telefone||'').replace(/\D/g,'') === tel);
  if (!m) return '<span style="display:inline-block;margin-top:5px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700">\u23F3 Sem resposta</span>';
  let txt, cor, bg;
  if (!m.vai) { txt = '\u274C N\u00e3o vai'; cor = '#ef4444'; bg = 'rgba(239,68,68,0.12)'; }
  else if (m.sentido === 'ida') { txt = '\u27A1\uFE0F S\u00f3 ida'; cor = '#3b82f6'; bg = 'rgba(59,130,246,0.12)'; }
  else if (m.sentido === 'volta') { txt = '\u2B05\uFE0F S\u00f3 volta'; cor = '#f59e0b'; bg = 'rgba(245,158,11,0.12)'; }
  else { txt = '\u2705 Vai e volta'; cor = '#10b981'; bg = 'rgba(16,185,129,0.12)'; }
  return '<span style="display:inline-block;margin-top:5px;background:' + bg + ';border:1px solid ' + cor + ';color:' + cor + ';border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700">' + txt + '</span>';
}

function commRenderPresencas(lista, ferias) {
  const el = document.getElementById('commPresencas');
  if (!el) return;
  ferias = ferias || [];
  const feriasTel = ferias.map(f => (f.telefone||'').replace(/\D/g,''));
  const ativos = lista.filter(p => !feriasTel.includes((p.telefone||'').replace(/\D/g,'')));

  const vaoVoltam = ativos.filter(p => p.vai && (!p.sentido || p.sentido === 'ambos'));
  const soIda     = ativos.filter(p => p.vai && p.sentido === 'ida');
  const soVolta   = ativos.filter(p => p.vai && p.sentido === 'volta');
  const naoVao    = ativos.filter(p => !p.vai);

  if (!lista.length && !ferias.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:6px">Nenhuma confirma\u00e7\u00e3o ainda.</div>';
    return;
  }

  const primeiroNome = (n) => esc((n||'').split(' ').slice(0,2).join(' '));

  // Bloco reutilizavel: titulo + chips coloridos (sem riscar)
  function quadro(titulo, emoji, itens, cor, corBg, corBorda) {
    if (!itens.length) return '';
    let b = '<div style="background:' + corBg + ';border:1px solid ' + corBorda + ';border-radius:12px;padding:10px 12px;margin-bottom:8px">';
    b += '<div style="font-size:12px;color:' + cor + ';font-weight:800;font-family:Barlow;margin-bottom:8px;display:flex;align-items:center;gap:6px">' + emoji + ' ' + titulo + ' <span style="background:' + cor + ';color:#000;border-radius:10px;padding:0 7px;font-size:11px">' + itens.length + '</span></div>';
    b += '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      itens.map(p => '<span style="background:var(--surface);border:1px solid ' + corBorda + ';border-radius:12px;padding:4px 10px;font-size:12px;color:var(--text)">' + primeiroNome(p.nome) + '</span>').join('') +
      '</div>';
    b += '</div>';
    return b;
  }

  let h = '';
  h += quadro('V\u00e3o e voltam', '\u2705', vaoVoltam, '#10b981', 'rgba(16,185,129,0.10)', 'rgba(16,185,129,0.35)');
  h += quadro('S\u00f3 ida', '\u27A1\uFE0F', soIda, '#3b82f6', 'rgba(59,130,246,0.10)', 'rgba(59,130,246,0.35)');
  h += quadro('S\u00f3 volta', '\u2B05\uFE0F', soVolta, '#f59e0b', 'rgba(245,158,11,0.10)', 'rgba(245,158,11,0.35)');
  h += quadro('N\u00e3o v\u00e3o hoje', '\u274C', naoVao, '#ef4444', 'rgba(239,68,68,0.10)', 'rgba(239,68,68,0.35)');
  if (ferias.length) {
    h += quadro('De f\u00e9rias', '\uD83C\uDFD6\uFE0F', ferias, '#f59e0b', 'rgba(245,158,11,0.08)', 'rgba(245,158,11,0.30)');
  }
  el.innerHTML = h;
}

async function commRodadaEscolhida() {
  // Data escolhida pelo motorista/gestor no campo; se vazio, usa o calculo automatico por turno.
  const el = document.getElementById('commDataViagem');
  if (el && el.value) return el.value;
  return commRodada(window._commTurno);
}

async function commCompartilharLocal() {
  const link = prompt('Cole o link de localização em tempo real da van.\n\nComo gerar no Google Maps:\n1. Abra o Google Maps\n2. Toque na sua foto de perfil\n3. Compartilhamento de localização\n4. Compartilhar > Até você desativar\n5. Copiar link\n\n(O WhatsApp não gera link — use o Google Maps)');
  if (!link) return;
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'rastreador');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const chave = window._commChave, rodada = await commRodadaEscolhida();
    const hojeRef = hojeLocal();
    lista = lista.filter(t => !(t.chave === chave && t.rodada === rodada));
    lista = lista.filter(t => !t.rodada || t.rodada >= hojeRef);
    lista.push({ chave, rodada, link, em: new Date().toISOString() });
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    const _p = rodada.split('-');
    document.getElementById('commLocalStatus').textContent = 'Localização compartilhada para ' + (_p.length===3 ? (_p[2]+'/'+_p[1]) : rodada);
    commAtualizarBotoesLoc(true);
  } catch(e) { alert('Erro ao compartilhar: ' + e.message); }
}

function commAtualizarBotoesLoc(ativo) {
  const bC = document.getElementById('btnCompartLoc');
  const bP = document.getElementById('btnPararCompart');
  if (bC) bC.style.display = ativo ? 'none' : 'block';
  if (bP) bP.style.display = ativo ? 'block' : 'none';
}

async function commPararCompartilhar() {
  if (!confirm('Parar de compartilhar a localização da van com os passageiros?')) return;
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'rastreador');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const chave = window._commChave, rodada = await commRodadaEscolhida();
    lista = lista.filter(t => !(t.chave === chave && t.rodada === rodada));
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    document.getElementById('commLocalStatus').textContent = 'Compartilhamento encerrado.';
    commAtualizarBotoesLoc(false);
  } catch(e) { alert('Erro ao parar: ' + e.message); }
}

function commToggleChat() {
  _commChatAberto = !_commChatAberto;
  const box = document.getElementById('commChatBox');
  box.style.display = _commChatAberto ? 'block' : 'none';
  document.getElementById('commChatBadge').style.display = 'none';
  if (_commChatAberto) {
    box.innerHTML = '<div id="commChatMsgs" style="max-height:300px;overflow-y:auto;background:var(--bg);border-radius:10px;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:8px"></div>' +
      '<div style="display:flex;gap:6px"><input id="commChatInput" placeholder="Mensagem aos passageiros..." style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:10px 14px;color:var(--text);font-size:14px" onkeypress="if(event.key===\'Enter\')commEnviar()"><button onclick="commEnviar()" style="background:var(--accent);border:none;border-radius:50%;width:42px;height:42px;font-size:17px;cursor:pointer"></button></div>';
    commCarregarChatInicial();
  }
}

async function commCarregarChatInicial() {
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, commChatDocId(window._commChave)));
    const msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
    commRenderChat(msgs);
  } catch(e) {}
}

function commRenderChat(msgs) {
  const box = document.getElementById('commChatMsgs');
  if (!box) return;
  const meuNome = document.getElementById('selMotorista').value;
  box.innerHTML = msgs.map((m, _i, _arr) => {
    const ehEu = m.tipo === 'motorista' && m.autor === meuNome;
    const cor = m.tipo === 'gestor' ? 'rgba(245,158,11,0.15)' : m.tipo === 'motorista' ? 'rgba(59,130,246,0.15)' : 'var(--surface2)';
    const align = ehEu ? 'flex-end' : 'flex-start';
    let inner = '';
    if (m.autor && !ehEu) inner += '<div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:2px">' + esc(m.autor) + '</div>';
    if (m.tipo === 'loc') inner += '' + esc(m.txt) + (m.link ? ' <a href="'+esc(m.link)+'" target="_blank" style="color:var(--green)">abrir</a>' : '');
    else inner += esc(m.txt);
    if (m.hora) inner += '<div style="font-size:9px;color:var(--muted);text-align:right;margin-top:2px">' + m.hora + '</div>';
    var _sep = _sepDataChat(m, _i > 0 ? _arr[_i-1] : null);
    return _sep + '<div style="align-self:' + align + ';max-width:80%;background:' + cor + ';border-radius:12px;padding:8px 11px;font-size:13px">' + inner + '</div>';
  }).join('');
  box.scrollTop = box.scrollHeight;
}

async function commEnviar() {
  const inp = document.getElementById('commChatInput');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  const meuNome = document.getElementById('selMotorista').value || 'Motorista';
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, commChatDocId(window._commChave));
    const snap = await getDoc(ref);
    let msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
    const hora = String(new Date().getHours()).padStart(2,'0') + ':' + String(new Date().getMinutes()).padStart(2,'0');
    msgs.push({ tipo:'motorista', autor: meuNome + ' (motorista)', txt, hora, em: new Date().toISOString() });
    if (msgs.length > 200) msgs = msgs.slice(-200);
    await setDoc(ref, { msgs, updatedAt: new Date().toISOString() });
  } catch(e) { inp.value = txt; alert('Erro ao enviar.'); }
}

// ===== COMUNICAÇÃO DA ROTA EXTRA =====
let _commExtraUnsub = {};

// ===== GPS AO VIVO (motorista) =====
let _gpsWatchId = null;       // id do watchPosition
let _gpsAtivo = false;        // estado do compartilhamento
let _gpsUltimoEnvio = 0;      // timestamp do ultimo envio (ms)
let _gpsUltimaPos = null;     // ultima posicao enviada {lat,lng}
const GPS_INTERVALO_MS = 12000;   // reenvia por tempo no maximo a cada 12s (mesmo parado)
const GPS_MIN_METROS = 15;        // OU reenvia assim que mover >15m (o que vier primeiro)
function _gpsDist(a, b) { if(!a||!b) return 9999; const R=6371000, t=Math.PI/180; const dLat=(b.lat-a.lat)*t, dLng=(b.lng-a.lng)*t; const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(x)); }
// ===== MAPA DA ROTA EMBUTIDO (motorista dentro do app) =====
let _mapaRota = null, _mapaRenderer = null, _mapaMotoristaMk = null, _mapaAberto = false, _mapaStopMks = [];

function commToggleMapaRota() {
  const wrap = document.getElementById('commMapaWrap');
  if (!wrap) return;
  _mapaAberto = !_mapaAberto;
  wrap.style.display = _mapaAberto ? 'block' : 'none';
  const btn = document.getElementById('btnMapaRota');
  if (btn) btn.textContent = _mapaAberto ? '\uD83D\uDDFA\uFE0F Ocultar mapa da rota' : '\uD83D\uDDFA\uFE0F Ver mapa da rota';
  if (_mapaAberto) commDesenharMapaRota();
}

async function commDesenharMapaRota() {
  const ok = await commCarregarMaps();
  if (!ok) return;
  const el = document.getElementById('commMapa');
  if (!el) return;

  // Rota fixa da linha atual
  const rota = DATA.find(r => String(r.linha) === String(window._commLinha) && r.turno === window._commTurno);
  if (!rota) { el.innerHTML = '<div style="padding:16px;color:var(--muted);text-align:center">Rota nao encontrada.</div>'; return; }

  const isVertiv = String(rota.linha).startsWith('VERTIV');
  const garagem = { lat: GARAGEM_COORDS.lat, lng: GARAGEM_COORDS.lng };
  const destino = isVertiv ? VERTIV_COORDS : EMPRESA_COORDS;
  const paradas = rota.passageiros
    .filter(p => p.status === 'ativo' && p.lat && p.lng)
    .sort((a,b) => (a.horario||'99:99').localeCompare(b.horario||'99:99'))
    .map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng), nome: p.nome, hora: p.horario }));

  // Criar mapa uma vez
  if (!_mapaRota) {
    _mapaRota = new google.maps.Map(el, {
      center: garagem, zoom: 12, disableDefaultUI: true, zoomControl: true,
      gestureHandling: 'greedy', clickableIcons: false
    });
    _mapaRenderer = new google.maps.DirectionsRenderer({
      map: _mapaRota, suppressMarkers: true,
      polylineOptions: { strokeColor: '#f59e0b', strokeWeight: 5, strokeOpacity: 0.9 }
    });
  }

  // Limpar marcadores de parada anteriores
  _mapaStopMks.forEach(m => m.setMap(null));
  _mapaStopMks = [];

  // Marcador garagem (inicio)
  _mapaStopMks.push(new google.maps.Marker({
    position: garagem, map: _mapaRota, title: 'Garagem (inicio)',
    label: { text: 'G', color: '#fff', fontWeight: 'bold', fontSize: '12px' },
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 11, fillColor: '#16a34a', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
  }));
  // Marcadores das paradas (numerados)
  paradas.forEach((p, i) => {
    const mk = new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng }, map: _mapaRota,
      title: (i+1) + '. ' + p.nome + (p.hora ? ' \u00b7 ' + p.hora : ''),
      label: { text: String(i+1), color: '#000', fontWeight: 'bold', fontSize: '12px' },
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 11, fillColor: '#f59e0b', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
    });
    _mapaStopMks.push(mk);
  });
  // Marcador destino
  _mapaStopMks.push(new google.maps.Marker({
    position: destino, map: _mapaRota, title: 'Destino',
    label: { text: '\uD83C\uDFC1', fontSize: '14px' },
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
  }));

  // Tracar a rota (linha na estrada)
  if (paradas.length) {
    const ds = new google.maps.DirectionsService();
    const waypoints = paradas.map(p => ({ location: { lat: p.lat, lng: p.lng }, stopover: true }));
    ds.route({ origin: garagem, destination: destino, waypoints, optimizeWaypoints: false, travelMode: 'DRIVING' },
      (res, st) => { if (st === 'OK') _mapaRenderer.setDirections(res); });
  }

  // Se ja existe posicao do motorista, mostra a bolinha
  if (_gpsUltimaPos) commAtualizarBolinhaMotorista(_gpsUltimaPos.lat, _gpsUltimaPos.lng);
}

function commAtualizarBolinhaMotorista(lat, lng) {
  if (!_mapaRota || !window.google || !google.maps) return;
  const pos = { lat, lng };
  if (!_mapaMotoristaMk) {
    _mapaMotoristaMk = new google.maps.Marker({
      position: pos, map: _mapaRota, title: 'Voce (van)', zIndex: 999,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#2563eb', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 }
    });
  } else {
    _mapaMotoristaMk.setPosition(pos);
  }
  _mapaRota.panTo(pos);
}

window.commGpsToggle = function() { if (_gpsAtivo) commGpsParar(); else commGpsAtivar(); };
async function commGpsAtivar() {
  if (!navigator.geolocation) { alert('Este celular nao suporta GPS pelo navegador.'); return; }
  if (!window._commChave) { alert('Abra a comunicacao da linha antes de iniciar o GPS.'); return; }
  const st = document.getElementById('commGpsStatus');
  if (st) st.textContent = 'Buscando sinal de GPS...';
  _gpsAtivo = true; _gpsUltimaPos = null; _gpsUltimoEnvio = 0;
  const btn = document.getElementById('btnGpsVivo');
  if (btn) { btn.textContent = '\u23F9\uFE0F Parar GPS ao vivo'; btn.style.background = 'var(--red)'; btn.style.color = '#fff'; }
  // Abrir o mapa embutido automaticamente (mantem o motorista no app)
  if (!_mapaAberto) commToggleMapaRota();
  else commDesenharMapaRota();
  _gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => commGpsEnviar(pos.coords.latitude, pos.coords.longitude),
    (err) => { const s=document.getElementById('commGpsStatus'); if(s) s.textContent = 'Erro de GPS: '+(err.message||'sem permissao'); },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}
async function commGpsParar() {
  _gpsAtivo = false;
  if (_gpsWatchId != null) { navigator.geolocation.clearWatch(_gpsWatchId); _gpsWatchId = null; }
  const btn = document.getElementById('btnGpsVivo');
  if (btn) { btn.textContent = '\uD83D\uDEF0\uFE0F Iniciar GPS ao vivo'; btn.style.background = 'var(--green)'; btn.style.color = '#04210f'; }
  const st = document.getElementById('commGpsStatus'); if (st) st.textContent = '';
  // marca no Firebase que parou (remove lat/lng, mantem registro)
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'rastreador');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const chave = window._commChave, rodada = commRodada(window._commTurno);
    lista = lista.map(t => (t.chave===chave && t.rodada===rodada) ? { ...t, gpsAtivo:false } : t);
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
  } catch(e) {}
}
async function commGpsEnviar(lat, lng) {
  if (!_gpsAtivo) return;
  // Move a bolinha no mapa a cada leitura (independente do throttle de rede)
  commAtualizarBolinhaMotorista(lat, lng);
  const agora = Date.now();
  const novaPos = { lat, lng };
  // Primeira leitura: envia sempre. Depois: envia se MOVEU >= minimo OU se passou o intervalo de tempo.
  if (_gpsUltimaPos) {
    const moveu = _gpsDist(_gpsUltimaPos, novaPos) >= GPS_MIN_METROS;
    const passouTempo = (agora - _gpsUltimoEnvio) >= GPS_INTERVALO_MS;
    if (!moveu && !passouTempo) return;
  }
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'rastreador');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const chave = window._commChave, rodada = commRodada(window._commTurno);
    lista = lista.filter(t => !t.rodada || t.rodada >= rodada);
    const idx = lista.findIndex(t => t.chave===chave && t.rodada===rodada);
    const item = { chave, rodada, lat, lng, gpsAtivo:true, em: new Date().toISOString() };
    if (idx >= 0) { item.link = lista[idx].link || ''; lista[idx] = item; } else { lista.push(item); }
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    _gpsUltimaPos = novaPos; _gpsUltimoEnvio = agora;
    const st = document.getElementById('commGpsStatus');
    if (st) st.textContent = '\u2705 Enviando posicao ao vivo \u00b7 ' + new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  } catch(e) { const s=document.getElementById('commGpsStatus'); if(s) s.textContent='Sem internet agora, tentando...'; }
}

async function commExtraLocal(rotaId) {
  const link = prompt('Cole o link de localização ao vivo da van para esta rota extra:');
  if (!link) return;
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const ref = doc(db, CLIENTE_ID, 'rastreador');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const chave = 'extra_' + rotaId;
    const rodada = hojeLocal();
    lista = lista.filter(t => !(t.chave === chave && t.rodada === rodada));
    lista.push({ chave, rodada, link, em: new Date().toISOString() });
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    alert('Localização compartilhada com os passageiros desta rota extra!');
  } catch(e) { alert('Erro: ' + e.message); }
}

async function commExtraChat(rotaId, nomeRota) {
  const box = document.getElementById('commExtraBox-' + rotaId);
  if (!box) return;
  const aberto = box.style.display === 'block';
  if (aberto) {
    box.style.display = 'none';
    if (_commExtraUnsub[rotaId]) { _commExtraUnsub[rotaId](); delete _commExtraUnsub[rotaId]; }
    return;
  }
  box.style.display = 'block';
  box.innerHTML = '<div id="commExtraMsgs-' + rotaId + '" style="max-height:280px;overflow-y:auto;background:var(--bg);border-radius:10px;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:8px"></div>' +
    '<div style="display:flex;gap:6px"><input id="commExtraInput-' + rotaId + '" placeholder="Mensagem aos passageiros..." style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:10px 14px;color:var(--text);font-size:14px" onkeypress="if(event.key===\'Enter\')commExtraEnviar(\'' + rotaId + '\')"><button onclick="commExtraEnviar(\'' + rotaId + '\')" style="background:var(--accent);border:none;border-radius:50%;width:42px;height:42px;font-size:17px;cursor:pointer"></button></div>';
  try {
    const db = await commGetDb();
    const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const docId = 'chat_extra_' + rotaId.replace(/[^a-zA-Z0-9_]/g,'');
    _commExtraUnsub[rotaId] = onSnapshot(doc(db, CLIENTE_ID, docId), (snap) => {
      const msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
      const mbox = document.getElementById('commExtraMsgs-' + rotaId);
      if (!mbox) return;
      const meuNome = document.getElementById('selMotoristaHoje').value || 'Motorista';
      mbox.innerHTML = msgs.map((m, _i, _arr) => {
        const ehEu = m.tipo === 'motorista' && m.autor && m.autor.indexOf(meuNome) === 0;
        const cor = m.tipo === 'gestor' ? 'rgba(245,158,11,0.15)' : m.tipo === 'motorista' ? 'rgba(59,130,246,0.15)' : 'var(--surface2)';
        const align = ehEu ? 'flex-end' : 'flex-start';
        let inner = '';
        if (m.autor && !ehEu) inner += '<div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:2px">' + esc(m.autor) + '</div>';
        inner += esc(m.txt);
        if (m.hora) inner += '<div style="font-size:9px;color:var(--muted);text-align:right;margin-top:2px">' + m.hora + '</div>';
        var _sep = _sepDataChat(m, _i > 0 ? _arr[_i-1] : null);
        return _sep + '<div style="align-self:' + align + ';max-width:80%;background:' + cor + ';border-radius:12px;padding:8px 11px;font-size:13px">' + inner + '</div>';
      }).join('');
      mbox.scrollTop = mbox.scrollHeight;
    });
  } catch(e) { console.warn('chat extra:', e); }
}

async function commExtraEnviar(rotaId) {
  const inp = document.getElementById('commExtraInput-' + rotaId);
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  const meuNome = document.getElementById('selMotoristaHoje').value || 'Motorista';
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const docId = 'chat_extra_' + rotaId.replace(/[^a-zA-Z0-9_]/g,'');
    const ref = doc(db, CLIENTE_ID, docId);
    const snap = await getDoc(ref);
    let msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
    const hora = String(new Date().getHours()).padStart(2,'0') + ':' + String(new Date().getMinutes()).padStart(2,'0');
    msgs.push({ tipo:'motorista', autor: meuNome + ' (motorista)', txt, hora, em: new Date().toISOString() });
    if (msgs.length > 200) msgs = msgs.slice(-200);
    await setDoc(ref, { msgs, updatedAt: new Date().toISOString() });
  } catch(e) { inp.value = txt; alert('Erro ao enviar.'); }
}

async function commCarregarHorariosDoDia(rotaId) {
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'horarios_do_dia'));
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    // só os da rodada vigente
    const rota = DATA.find(r => r.id === rotaId);
    if (!rota) return;
    const rodada = commRodada(rota.turno);
    window._horariosDoDia = all.filter(x => x.rodada === rodada);
    window._horariosDoDiaCarregado = true;
    // re-renderizar a rota agora que temos os dados
    if (document.getElementById('selLinha') && document.getElementById('selLinha').value === rotaId) {
      loadRota();
    }
  } catch(e) { console.warn('horarios_do_dia:', e); }
}

async function commCarregarMaps() {
  if (_commMapsLoaded && window.google && window.google.maps) return true;
  if (window.google && window.google.maps) { _commMapsLoaded = true; return true; }
  // Pegar a Maps key do Firebase (config)
  let mapsKey = '';
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, CLIENTE_ID, 'config'));
    if (snap.exists()) mapsKey = snap.data().mapsApiKey || '';
  } catch(e) {}
  if (!mapsKey) { alert('A chave do Google Maps não está configurada. Peça ao gestor para abrir o sistema (index), ir em Config e salvar a chave do Google Maps — ela é sincronizada automaticamente.'); return false; }
  return new Promise((resolve) => {
    let resolvido = false;
    const finalizar = (ok) => { if (resolvido) return; resolvido = true; resolve(ok); };
    window._commMapsReady = () => { _commMapsLoaded = true; finalizar(true); };
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + mapsKey + '&libraries=geometry&callback=_commMapsReady';
    s.async = true;
    s.onerror = () => { alert('Erro ao carregar o Google Maps. Verifique a conexão e se a chave da API permite este endereço (restrições de referer/HTTP).'); finalizar(false); };
    document.head.appendChild(s);
    setTimeout(() => {
      if (resolvido) return;
      if (window.google && window.google.maps) { _commMapsLoaded = true; finalizar(true); }
      else { alert('O Google Maps demorou para responder. Possível causa: a chave da API tem restrição de domínio que bloqueia este endereço. Verifique no Google Cloud as restrições da chave (HTTP referrers).'); finalizar(false); }
    }, 15000);
  });
}

function commToMin(hhmm){ const [h,m]=hhmm.split(':').map(Number); return h*60+m; }
function commFromMin(m){ m=((m%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); }

async function commRecalcular() {
  const status = document.getElementById('commRecalcStatus');
  status.textContent = '⏳ Carregando mapa...';
  const ok = await commCarregarMaps();
  if (!ok) { status.textContent = ''; return; }

  // Achar a rota fixa da linha atual
  const rota = DATA.find(r => String(r.linha) === String(window._commLinha) && r.turno === window._commTurno);
  if (!rota) { status.textContent = 'Rota não encontrada.'; return; }

  status.textContent = '⏳ Verificando quem não vai e férias...';
  const chave = window._commChave;
  const rodada = commRodada(window._commTurno);
  let ausentesTel = [];
  try {
    const db = await commGetDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const hoje = hojeLocal();
    // não-vou de hoje
    const sp = await getDoc(doc(db, CLIENTE_ID, 'presencas'));
    const presList = (sp.exists() && sp.data().lista) ? sp.data().lista : [];
    presList.filter(p => p.chave === chave && p.rodada === rodada && !p.vai).forEach(p => ausentesTel.push((p.telefone||'').replace(/\D/g,'')));
    // férias vigentes
    const sf = await getDoc(doc(db, CLIENTE_ID, 'ferias'));
    const ferList = (sf.exists() && sf.data().lista) ? sf.data().lista : [];
    ferList.filter(f => f.chave === chave && f.inicio <= hoje && f.fim >= hoje).forEach(f => ausentesTel.push((f.telefone||'').replace(/\D/g,'')));
  } catch(e) {}

  // Passageiros que VÃO: ordem fixa (por horário), removendo ausentes (quem não respondeu fica)
  const todosFixos = rota.passageiros
    .filter(p => p.status === 'ativo')
    .sort((a,b) => (a.horario||'99:99').localeCompare(b.horario||'99:99'));
  const vaoFixos = todosFixos.filter(p => !ausentesTel.includes((p.telefone||'').replace(/\D/g,'')));
  const removidos = todosFixos.length - vaoFixos.length;

  if (vaoFixos.length < 1) { status.textContent = 'Ninguém vai hoje nesta linha.'; return; }
  if (!vaoFixos.every(p => p.lat && p.lng)) { status.textContent = 'Alguns passageiros estão sem coordenadas. Não dá para recalcular com precisão.'; return; }

  status.textContent = '⏳ Calculando rota (ordem fixa)...';

  // Chamar Directions com ordem FIXA (optimizeWaypoints:false)
  const isVertiv = String(rota.linha).startsWith('VERTIV');
  const garagem = { lat: GARAGEM_COORDS.lat, lng: GARAGEM_COORDS.lng };
  const destino = isVertiv ? VERTIV_COORDS : EMPRESA_COORDS;
  const waypoints = vaoFixos.map(p => ({ location: { lat: parseFloat(p.lat), lng: parseFloat(p.lng) }, stopover: true }));

  const ds = new google.maps.DirectionsService();
  let respondeu = false;
  const timeoutId = setTimeout(() => {
    if (!respondeu) {
      status.innerHTML = 'O Google Maps não respondeu. Verifique se a <b>Directions API</b> está ativada no Google Cloud e se a chave permite este domínio.';
    }
  }, 12000);
  ds.route({ origin: garagem, destination: destino, waypoints, optimizeWaypoints: false, travelMode: 'DRIVING' }, async (res, st) => {
    respondeu = true;
    clearTimeout(timeoutId);
    if (st !== 'OK') {
      let msg = 'Erro no cálculo: ' + st;
      if (st === 'REQUEST_DENIED') msg = 'A chave do Google Maps não tem permissão para a Directions API. Ative a "Directions API" no Google Cloud.';
      else if (st === 'OVER_QUERY_LIMIT') msg = 'Limite de uso do Google Maps atingido. Tente novamente em instantes.';
      else if (st === 'ZERO_RESULTS') msg = 'Não foi possível traçar a rota entre estes pontos.';
      status.innerHTML = msg;
      return;
    }
    const legs = res.routes[0].legs;
    const legSec = legs.map(l => l.duration.value);
    const totalMin = Math.round(legSec.reduce((a,b)=>a+b,0)/60);
    // Modo Sábado: usa o horário de chegada informado no checkbox, no lugar do horário do turno
    const cbSab = document.getElementById('commSabado');
    const horaSab = document.getElementById('commSabadoHora');
    let chegada;
    if (cbSab && cbSab.checked && horaSab && /^\d{2}:\d{2}$/.test(horaSab.value)) {
      chegada = horaSab.value;   // o motorista mandou um horário: respeita
    } else {
      // Antes vinha sempre o horário do dia útil. Agora o calendário do turno
      // responde pelo dia de hoje — sábado alternado, sexta mais cedo etc.
      const _r = tvTurnoNoDia(rota.turno, tvHoje());
      chegada = _r.chegada || TURNOS_CHEGADA[rota.turno] || '05:45';
    }
    const ehSabado = !!(cbSab && cbSab.checked);
    // Folga de segurança ajustável pelo motorista (padrão 5 min)
    const folgaEl = document.getElementById('commFolga');
    let buffer = folgaEl ? parseInt(folgaEl.value, 10) : 5;
    if (isNaN(buffer) || buffer < 0) buffer = 5;
    const arrMin = commToMin(chegada);
    const n = vaoFixos.length;
    const novos = vaoFixos.map((p, k) => {
      let secAteEmpresa = 0;
      for (let j=k+1; j<=n; j++) secAteEmpresa += legSec[j];
      return { nome: p.nome, telefone: p.telefone, embarque: p.embarque||p.endereco||'', bairro: p.bairro||'', horarioNovo: commFromMin(arrMin - buffer - Math.round(secAteEmpresa/60)), horarioOrig: p.horario||'', lat:p.lat, lng:p.lng, ordem:k+1 };
    });
    const saida = commFromMin(arrMin - buffer - totalMin);
    commMostrarPreviaRecalc(novos, saida, chegada, totalMin, removidos, rota, ehSabado, buffer);
    status.textContent = '';
  });
}

function commMostrarPreviaRecalc(novos, saida, chegada, totalMin, removidos, rota, ehSabado, buffer) {
  window._recalcDados = { novos, saida, chegada, totalMin, rota };
  let h = '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:flex-end;justify-content:center" onclick="if(event.target===this)this.remove()">';
  h += '<div style="background:var(--surface);border-radius:18px 18px 0 0;width:100%;max-width:600px;max-height:88vh;overflow-y:auto;padding:20px">';
  h += '<div style="font-family:Barlow;font-weight:800;font-size:18px;margin-bottom:4px">Horários recalculados</div>';
  if (ehSabado) h += '<div style="background:rgba(245,158,11,0.15);border:1px solid var(--accent);color:var(--accent);border-radius:8px;padding:8px 10px;font-size:12px;font-weight:700;margin-bottom:10px">Modo Sábado — chegada às ' + chegada + '</div>';
  h += '<div style="font-size:13px;color:var(--muted);margin-bottom:14px">' + removidos + ' ausente(s) removido(s) · ordem mantida · folga ' + (buffer!=null?buffer:5) + ' min</div>';
  h += '<div style="background:var(--surface2);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center">';
  h += '<div style="font-size:13px;color:var(--muted)">Nova saída da garagem</div>';
  h += '<div style="font-size:30px;font-weight:800;font-family:Barlow;color:var(--accent)">' + saida + '</div>';
  h += '<div style="font-size:12px;color:var(--muted)">' + totalMin + ' min · chegada ' + chegada + '</div></div>';
  h += '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Embarques:</div>';
  novos.forEach(p => {
    const mudou = p.horarioOrig && p.horarioOrig !== p.horarioNovo;
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">';
    h += '<div><div style="font-weight:600;font-size:14px">' + p.ordem + '. ' + esc(p.nome) + '</div><div style="font-size:11px;color:var(--muted)">' + esc(p.embarque) + '</div></div>';
    h += '<div style="text-align:right">';
    if (mudou) h += '<div style="font-size:11px;color:var(--muted);text-decoration:line-through">' + p.horarioOrig + '</div>';
    h += '<div style="font-weight:800;color:' + (mudou?'var(--accent)':'var(--text)') + ';font-size:16px">' + p.horarioNovo + '</div></div>';
    h += '</div>';
  });
  h += '<div style="display:flex;gap:10px;margin-top:16px">';
  h += '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="flex:1;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:13px;font-weight:700;font-family:Barlow;cursor:pointer">Cancelar</button>';
  h += '<button id="btnPublicarRecalc" onclick="commPublicarRecalc()" style="flex:2;background:var(--green);color:#fff;border:none;border-radius:10px;padding:13px;font-weight:800;font-family:Barlow;cursor:pointer">Publicar e avisar passageiros</button>';
  h += '</div></div></div>';
  const div = document.createElement('div');
  div.innerHTML = h;
  document.body.appendChild(div.firstChild);
}

async function commPublicarRecalc() {
  const d = window._recalcDados;
  if (!d) return;
  const btn = document.getElementById('btnPublicarRecalc');
  if (btn) { btn.textContent = '⏳ Publicando...'; btn.style.background = '#6b7280'; btn.disabled = true; }
  try {
    const db = await commGetDb();
    const { doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const chave = window._commChave;
    const rodada = commRodada(window._commTurno);
    const ref = doc(db, CLIENTE_ID, 'horarios_do_dia');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    lista = lista.filter(x => !x.rodada || x.rodada >= rodada);
    lista = lista.filter(x => !(x.chave === chave && x.rodada === rodada));
    lista.push({ chave, rodada, saida: d.saida, chegada: d.chegada, totalMin: d.totalMin, paradas: d.novos, em: new Date().toISOString() });
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });

    const meuNome = document.getElementById('selMotorista').value || 'Motorista';
    const refChat = doc(db, CLIENTE_ID, commChatDocId(chave));
    const snapC = await getDoc(refChat);
    let msgs = (snapC.exists() && snapC.data().msgs) ? snapC.data().msgs : [];
    const hora = String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0');
    msgs.push({ tipo:'gestor', autor:'Sistema', txt:'Horários de HOJE ajustados pelo motorista. Confira seu novo horário de embarque na tela inicial.', hora, em:new Date().toISOString() });
    if (msgs.length>200) msgs=msgs.slice(-200);
    await setDoc(refChat, { msgs, updatedAt: new Date().toISOString() });

    // Feedback visual de sucesso no botão
    if (btn) {
      btn.textContent = 'Publicado com sucesso!';
      btn.style.background = '#059669';
      btn.disabled = true;
    }
    window._recalcPublicado = { chave, rodada }; // marca para a lista de paradas usar
    window._horariosDoDiaCarregado = false; // força recarga
    window._horariosDoDiaPara = null;
    // Fecha o modal após 1,5s e atualiza a lista de paradas
    setTimeout(() => {
      const modal = document.querySelector('[style*="fixed"]');
      if (modal) modal.remove();
      if (typeof loadRota === 'function') loadRota();
    }, 1500);
  } catch(e) {
    if (btn) { btn.textContent = 'Erro — tente de novo'; btn.style.background = 'var(--red)'; btn.disabled = false; }
  }
}

// ---- LOCATION ----
function toggleLocation() {
  const btn = document.getElementById('locToggle');
  if (!useCurrentLocation) {
    // Try to get location
    if (!navigator.geolocation) {
      alert('Seu dispositivo não suporta geolocalização.');
      return;
    }
    btn.querySelector('.loc-toggle-sub').textContent = 'Obtendo localização...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        useCurrentLocation = true;
        btn.classList.add('active');
        btn.querySelector('.loc-toggle-title').textContent = 'Usando minha localização';
        btn.querySelector('.loc-toggle-sub').textContent = `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`;
        // Reload the route with new origin
        loadRota();
      },
      (err) => {
        btn.querySelector('.loc-toggle-sub').textContent = 'Não foi possível obter localização. Verifique as permissões.';
        currentCoords = null;
        useCurrentLocation = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    // Disable location
    useCurrentLocation = false;
    currentCoords = null;
    btn.classList.remove('active');
    btn.querySelector('.loc-toggle-title').textContent = 'Usando Garagem como início';
    btn.querySelector('.loc-toggle-sub').textContent = 'Toque para usar sua localização atual';
    loadRota();
  }
}

function getOriginCoords() {
  if (useCurrentLocation && currentCoords) return currentCoords;
  return GARAGEM_COORDS;
}

function buildWazeUrl(lat, lng, addr, cidade) {
  // Waze deep link - works on iOS and Android
  if (lat && lng) {
    return 'https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes&zoom=17';
  }
  const q = encodeURIComponent((addr || '') + ', ' + (cidade || 'Sorocaba') + ' SP');
  return 'https://waze.com/ul?q=' + q + '&navigate=yes';
}

function buildWazeRouteUrl(stops) {
  if (stops.length === 0) {
    return 'https://waze.com/ul?ll=' + EMPRESA_COORDS.lat + ',' + EMPRESA_COORDS.lng + '&navigate=yes';
  }
  const first = stops[0];
  // Waze will use device's current location as origin automatically
  return buildWazeUrl(first.lat, first.lng, first.embarque || first.endereco, first.cidade);
}

function buildMapsUrl(stops) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const destCoords = getDestCoords();
  const empLat = destCoords.lat, empLng = destCoords.lng;
  // Origem VAZIA = Maps usa a localizacao do celular e oferece "Iniciar".
  // Com origem fixa (garagem) longe do motorista, o Maps abre so a "Previa".
  const originStr = (useCurrentLocation && currentCoords) ? (currentCoords.lat + ',' + currentCoords.lng) : '';
  const dest = empLat + ',' + empLng;

  const wayAddrs = stops.map(function(p) {
    if (p.lat && p.lng) return p.lat + ',' + p.lng;
    return encodeURIComponent((p.embarque || p.endereco || '') + ', ' + (p.cidade||'Sorocaba') + ' SP');
  });

  if (stops.length === 0) {
    if (isAndroid || isIOS) return 'comgooglemaps://?daddr=' + dest + '&directionsmode=driving';
    return 'https://www.google.com/maps/dir/' + originStr + '/' + dest + '/';
  }

  // comgooglemaps:// com +to: suporta múltiplas paradas sem limite de 8
  const wpsChain = wayAddrs.join('+to:');
  const appUrl = 'comgooglemaps://?saddr=' + originStr + '&daddr=' + wpsChain + '+to:' + dest + '&directionsmode=driving';

  // Desktop: formato path /dir/ que não tem limite de 8 waypoints como o ?api=1
  const pathParts = [originStr].concat(wayAddrs).concat([dest]);
  const webUrl = 'https://www.google.com/maps/dir/' + pathParts.join('/');

  if (isAndroid || isIOS) return appUrl;
  return webUrl;
}

// Abre Maps tentando o app; se falhar (Maps não instalado no iOS) cai para web
function openMaps(stops) {
  const destCoords = getDestCoords();
  // Origem vazia => o Maps parte de onde o motorista esta e libera o botao "Iniciar"
  // com as paradas na sequencia. Origem fixa na garagem forcava o modo "Previa".
  const originStr = (useCurrentLocation && currentCoords) ? (currentCoords.lat + ',' + currentCoords.lng) : '';
  const dest = destCoords.lat + ',' + destCoords.lng;

  const wayAddrs = stops.map(function(p) {
    if (p.lat && p.lng) return p.lat + ',' + p.lng;
    return encodeURIComponent((p.embarque || p.endereco || '') + ', ' + (p.cidade||'Sorocaba') + ' SP');
  });

  // Formato /dir/ (web) NÃO tem o limite de ~10 paradas do esquema comgooglemaps://
  // No celular, esse link abre o app do Google Maps automaticamente.
  const pathParts = [originStr].concat(wayAddrs).concat([dest]);
  const webUrl = 'https://www.google.com/maps/dir/' + pathParts.join('/') + '/?travelmode=driving';

  window.open(webUrl, '_blank');
}





// ---- SEQUENTIAL NAVIGATION ----
function startSeqFromCurrent() {
  if (currentSeqRotaId && currentSeqStops.length > 0) {
    startSeqMode(currentSeqRotaId, currentSeqStops);
  }
}

function startSeqMode(rotaId, stops) {
  seqMode = true;
  seqCurrentIdx = 0;
  seqStops = stops;
  seqRotaId = rotaId;
  seqAbsent = new Set();
  renderSeqNav();
}

function exitSeqMode() {
  seqMode = false;
  seqCurrentIdx = 0;
  seqStops = [];
  loadRota(); // re-render full view
}

function nextStop() {
  let next = seqCurrentIdx + 1;
  // Skip absent passengers
  while (next < seqStops.length && seqAbsent.has(next)) next++;
  if (next <= seqStops.length) {
    seqCurrentIdx = next;
    renderSeqNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function markAbsent() {
  seqAbsent.add(seqCurrentIdx);
  // Move to next non-absent stop
  let next = seqCurrentIdx + 1;
  while (next < seqStops.length && seqAbsent.has(next)) next++;
  seqCurrentIdx = next;
  renderSeqNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStop() {
  if (seqCurrentIdx > 0) {
    seqCurrentIdx--;
    renderSeqNav();
  }
}

function jumpToStop(idx) {
  if (seqAbsent.has(idx)) {
    seqAbsent.delete(idx); // un-absent if tapped again
  }
  seqCurrentIdx = idx;
  renderSeqNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSeqNav() {
  const content = document.getElementById('rotaContent');
  const rota = DATA.find(r => r.id === seqRotaId);
  const chegada = { '1°': '05:45', '2°': '14:45', '3°': '20:55' }[rota.turno] || '';
  const total = seqStops.length;
  const isDone = seqCurrentIdx >= total;

  // Current stop or empresa
  const current = isDone ? null : seqStops[seqCurrentIdx];
  const mapsUrl = current
    ? buildWazeUrl(current.lat, current.lng, current.embarque || current.endereco, current.cidade)
      .replace('waze.com', 'waze.com') // keep waze
    : null;
  const wazeCurrent = current
    ? buildWazeUrl(current.lat, current.lng, current.embarque || current.endereco, current.cidade)
    : 'https://waze.com/ul?ll=' + EMPRESA_COORDS.lat + ',' + EMPRESA_COORDS.lng + '&navigate=yes';

  // Build navigation URL - uses google.navigation on Android for direct turn-by-turn
  const isAndroidSeq = /Android/i.test(navigator.userAgent);
  const destCoord = current
    ? (current.lat && current.lng ? current.lat + ',' + current.lng : null)
    : EMPRESA_COORDS.lat + ',' + EMPRESA_COORDS.lng;
  const destAddr = current
    ? encodeURIComponent((current.embarque||current.endereco||'') + ', ' + (current.cidade||'Sorocaba') + ' SP')
    : encodeURIComponent('Av. Jerome Case, 2600, Eden, Sorocaba SP');

  let mapsCurrent;
  if (isAndroidSeq && destCoord) {
    // Android: google.navigation opens Maps app directly in navigation mode
    mapsCurrent = 'google.navigation:q=' + destCoord + '&mode=d';
  } else if (destCoord) {
    // Sem origem: o Maps parte da posicao atual e ja entra em navegacao guiada.
    mapsCurrent = 'https://www.google.com/maps/dir/?api=1' +
      '&destination=' + destCoord + '&travelmode=driving&dir_action=navigate';
  } else {
    mapsCurrent = 'https://www.google.com/maps/dir/?api=1' +
      '&destination=' + destAddr + '&travelmode=driving&dir_action=navigate';
  }

  let html = '';

  // Exit button
  html += '<button class="seq-mode-toggle" onclick="exitSeqMode()">← Voltar à lista completa</button>';

  // Summary counts
  const absentCount = seqAbsent.size;
  const doneCount = seqStops.filter((p,i) => i < seqCurrentIdx && !seqAbsent.has(i)).length;
  const remaining = total - seqCurrentIdx - (isDone ? 0 : 0);
  html += '<div style="display:flex;gap:10px;margin-bottom:10px;font-size:12px">';
  html += '<span style="color:var(--green)">' + doneCount + ' embarcados</span>';
  if (absentCount > 0) html += '<span style="color:var(--red)">' + absentCount + ' ausentes</span>';
  if (!isDone) html += '<span style="color:var(--muted)">• parada ' + (seqCurrentIdx+1) + ' de ' + total + '</span>';
  html += '</div>';

  // Progress dots
  html += '<div class="seq-progress">';
  for (let i = 0; i < total; i++) {
    const isAbs = seqAbsent.has(i);
    const cls = isAbs ? '' : i < seqCurrentIdx ? 'done' : i === seqCurrentIdx ? 'current' : '';
    const style = isAbs ? 'background:var(--red);opacity:0.5' : '';
    html += '<div class="seq-dot ' + cls + '" style="' + style + '" onclick="jumpToStop(' + i + ')"></div>';
  }
  // empresa dot
  html += '<div class="seq-dot' + (isDone ? ' current' : '') + '"></div>';
  html += '</div>';

  if (!isDone) {
    // Current stop card
    html += '<div class="seq-nav-card">';
    html += '<div class="seq-nav-label">Parada ' + (seqCurrentIdx + 1) + ' de ' + total + '</div>';
    html += '<div class="seq-nav-time">' + (current.horario || '--:--') + '</div>';
    html += '<div class="seq-nav-name">' + current.nome + '</div>';
    if (current.telefone) html += '<div style="font-size:13px;color:var(--accent2);margin-bottom:6px">' + current.telefone + '</div>';
    html += '<div class="seq-nav-addr">' + (current.embarque || current.endereco || '—') + (current.bairro ? ' · ' + current.bairro : '') + '</div>';

    // Navigation buttons
    html += '<div class="seq-nav-btns">';
    // For google.navigation scheme, use onclick handler
    if (mapsCurrent.startsWith('google.navigation:')) {
      html += '<a href="' + mapsCurrent + '" class="nav-maps-btn" style="font-size:13px" onclick="androidNav(event,\'' + mapsCurrent + '\')"><span></span> Google Maps</a>';
    } else {
      html += '<a href="' + mapsCurrent + '" target="_blank" class="nav-maps-btn" style="font-size:13px"><span></span> Google Maps</a>';
    }
    html += '<a href="' + wazeCurrent + '" target="_blank" class="nav-waze-btn" style="font-size:13px"><span></span> Waze</a>';
    html += '</div>';

    // Action buttons
    html += '<button class="btn-next-stop" onclick="nextStop()" style="margin-bottom:8px">Embarquei — Próxima Parada</button>';
    html += '<button onclick="markAbsent()" style="width:100%;background:none;border:1px solid var(--red);color:var(--red);border-radius:12px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;font-family:Barlow,sans-serif">Ausente hoje — Pular esta parada</button>';
    html += '</div>';

    // Sneak peek at next stop
    if (seqCurrentIdx < total - 1) {
      const next = seqStops[seqCurrentIdx + 1];
      html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:12px">';
      html += '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">⏭ Próxima parada</div>';
      html += '<div style="font-weight:600">' + next.nome.split(' ').slice(0,2).join(' ') + '</div>';
      html += '<div style="font-size:12px;color:var(--muted)">' + (next.horario||'--:--') + ' · ' + (next.embarque||next.endereco||'—') + '</div>';
      html += '</div>';
    }

  } else {
    // Destination card
    html += '<div class="seq-nav-card" style="border-color:var(--accent2)">';
    html += '<div class="seq-nav-label" style="color:var(--accent2)">Destino Final</div>';
    html += '<div class="seq-nav-time" style="color:var(--accent2)">' + chegada + '</div>';
    html += '<div class="seq-nav-name">Huawei — Av. Jerome Case</div>';
    html += '<div class="seq-nav-addr">Av. Jerome Case, 2600 — Éden, Sorocaba-SP</div>';
    html += '<div class="seq-nav-btns">';
    if (mapsCurrent.startsWith('google.navigation:')) {
      html += '<a href="' + mapsCurrent + '" class="nav-maps-btn" style="font-size:13px" onclick="androidNav(event,\'' + mapsCurrent + '\')"><span></span> Google Maps</a>';
    } else {
      html += '<a href="' + mapsCurrent + '" target="_blank" class="nav-maps-btn" style="font-size:13px"><span></span> Google Maps</a>';
    }
    html += '<a href="' + wazeCurrent + '" target="_blank" class="nav-waze-btn" style="font-size:13px"><span></span> Waze</a>';
    html += '</div>';
    html += '<div style="text-align:center;padding:12px;color:var(--green);font-weight:700;font-size:15px">Todas as paradas concluídas!</div>';
    html += '</div>';
  }

  // Stops list overview
  html += '<div class="seq-stops-list">';
  seqStops.forEach((p, i) => {
    const isAbsent = seqAbsent.has(i);
    const isDoneStop = !isAbsent && i < seqCurrentIdx;
    const isCurrent = i === seqCurrentIdx && !isDone;
    const cls = isAbsent ? 'done' : isDoneStop ? 'done' : isCurrent ? 'current' : '';
    const icon = isAbsent ? '' : isDoneStop ? '' : isCurrent ? '●' : (i + 1);
    html += '<div class="seq-stop-item ' + cls + '" onclick="jumpToStop(' + i + ')" style="' + (isAbsent ? 'text-decoration:line-through;opacity:0.4' : '') + '">';
    html += '<div class="seq-stop-check" style="' + (isAbsent ? 'border-color:var(--red);color:var(--red)' : '') + '">' + icon + '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.nome.split(' ').slice(0,3).join(' ') + '</div>';
    html += '<div style="font-size:11px;color:var(--muted)">' + (p.horario||'--:--') + ' · ' + (p.embarque||p.endereco||'—').substring(0,30) + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span style="font-size:10px;background:var(--accent);color:#000;border-radius:4px;padding:2px 6px;font-weight:700">AGORA</span>';
    if (isAbsent) html += '<span style="font-size:10px;background:rgba(239,68,68,0.15);color:var(--red);border-radius:4px;padding:2px 6px;font-weight:700">AUSENTE</span>';
    html += '</div>';
  });
  // Empresa
  html += '<div class="seq-stop-item' + (isDone ? ' current' : '') + '">';
  html += '<div class="seq-stop-check">' + (isDone ? '●' : '') + '</div>';
  html += '<div style="flex:1"><div style="font-weight:600;font-size:13px">Empresa — Huawei</div>';
  html += '<div style="font-size:11px;color:var(--muted)">' + chegada + ' · Av. Jerome Case, 2600</div></div>';
  if (isDone) html += '<span style="font-size:10px;background:var(--accent2);color:#fff;border-radius:4px;padding:2px 6px;font-weight:700">DESTINO</span>';
  html += '</div>';
  html += '</div>';

  content.innerHTML = html;
}


function androidNav(e, url) {
  e.preventDefault();
  if (url.startsWith('comgooglemaps://')) {
    // Try app scheme, fallback to web
    const webUrl = url
      .replace('comgooglemaps://?saddr=', 'https://www.google.com/maps/dir/')
      .replace('&daddr=', '/')
      .replace('+to:', '/')
      .replace('&directionsmode=driving', '');
    window.location = url;
    setTimeout(() => { window.location = webUrl; }, 1500);
  } else {
    window.open(url, '_blank');
  }
}

function androidMapsClick(e, comgoogleUrl) {
  e.preventDefault();
  // Try to open Google Maps app via scheme, fallback to browser
  const fallbackUrl = comgoogleUrl.replace('comgooglemaps://', 'https://maps.google.com/maps');
  // Try app scheme first
  window.location = comgoogleUrl;
  // If app not installed, fallback to web after 1.5s
  setTimeout(() => { window.location = fallbackUrl; }, 1500);
}

function showNoData(title, msg) {
  document.getElementById('rotaContent').innerHTML =
    '<div class="no-data">' +
    '<div class="no-data-icon"></div>' +
    '<div class="no-data-title">' + title + '</div>' +
    '<div style="font-size:13px">' + msg + '</div>' +
    '</div>';
}

// Check if already on same device as management system
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install banner after 3 seconds if not already installed
  setTimeout(() => {
    const banner = document.getElementById('installBanner');
    if (banner && !window.matchMedia('(display-mode: standalone)').matches) {
      banner.style.display = 'flex';
    }
  }, 3000);
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      document.getElementById('installBanner').style.display = 'none';
    });
  }
}

window.onload = function() {
  // Dismiss splash screen after 1.8 seconds
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }
    // Iniciar app direto — sem login
    loadFromStorage();
  }, 800);

  // Show install instructions if not installed as PWA
  const isStandalone = window.navigator.standalone ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (!isStandalone) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Listen for Android install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = document.getElementById('installBanner');
      const btnArea = document.getElementById('installBtnArea');
      if (banner) banner.style.display = 'flex';
      if (btnArea) btnArea.innerHTML = '<button onclick="installPWA()" style="background:var(--accent);color:#000;border:none;border-radius:8px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap">Instalar</button>';
    });

    // iOS: show instructions after 3s
    if (isIOS) {
      setTimeout(() => {
        const banner = document.getElementById('installBanner');
        const btnArea = document.getElementById('installBtnArea');
        if (!banner) return;
        banner.style.display = 'flex';
        if (btnArea) btnArea.innerHTML = '<div style="font-size:11px;color:var(--accent);text-align:right">Safari: toque ↑ → "Adicionar à Tela de Início"</div>';
      }, 3000);
    }
  }
};

