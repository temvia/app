/* ============================================================
   MOTOR TEMVIA — APP DO PASSAGEIRO
   Engine compartilhado multi-cliente. NAO edite as cascas para
   mudar comportamento: toda melhoria vai AQUI e vale para todas
   as operacoes. A casca define window.CLIENTE_CONFIG.
   Fase 2 da profissionalizacao (extracao + limpeza visual).
   ============================================================ */

const CSS_MOTOR = "\n:root {\n  --bg: #0d1117; --surface: #161b22; --surface2: #1c2330; --surface3: #232b3a;\n  --border: #2d3748; --accent: #f59e0b; --accent2: #3b82f6; --green: #10b981;\n  --red: #ef4444; --text: #e6edf3; --muted: #8b949e;\n}\n* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color: transparent; }\nbody { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; min-height: 100vh; position: relative; padding-bottom: 70px; }\nh1,h2,h3,.brand { font-family: 'Barlow', sans-serif; }\n.hidden { display: none !important; }\n.login-wrap { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 30px 24px; }\n.login-logo { text-align: center; margin-bottom: 30px; }\n.login-logo .ico { font-size: 54px; }\n.login-logo .brand { font-size: 30px; font-weight: 800; letter-spacing: 1px; margin-top: 6px; }\n.login-logo .sub { color: var(--muted); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }\n.login-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 26px 22px; }\n.login-card h2 { font-size: 20px; margin-bottom: 6px; }\n.login-card p { color: var(--muted); font-size: 13px; margin-bottom: 18px; }\n.field-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: block; }\n.input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 14px; color: var(--text); font-size: 17px; font-family: inherit; }\n.input:focus { outline: none; border-color: var(--accent); }\n.btn { width: 100%; background: var(--accent); color: #000; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; font-family: 'Barlow',sans-serif; cursor: pointer; margin-top: 16px; }\n.btn:active { transform: scale(0.98); }\n.login-err { color: var(--red); font-size: 13px; margin-top: 12px; text-align: center; display: none; }\n.app-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 18px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 50; }\n.app-header .ava { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg,var(--accent),#d97706); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000; font-size: 17px; font-family: 'Barlow'; }\n.app-header .who { flex: 1; min-width:0; }\n.app-header .who .nm { font-weight: 700; font-size: 15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n.app-header .who .ln { font-size: 12px; color: var(--muted); }\n.app-header .logout { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; }\n.view { padding: 18px; }\n.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; margin-bottom: 14px; }\n.card-lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }\n.big { font-size: 28px; font-weight: 800; font-family: 'Barlow'; color: var(--accent); }\n.vou-wrap { display: flex; gap: 10px; margin-top: 4px; }\n.vou-btn { flex: 1; padding: 14px; border-radius: 12px; border: 2px solid var(--border); background: var(--surface2); color: var(--text); font-family: 'Barlow'; font-weight: 700; font-size: 14px; cursor: pointer; }\n.vou-btn.sim.on { background: rgba(16,185,129,0.15); border-color: var(--green); color: var(--green); }\n.vou-btn.ida.on { background: rgba(59,130,246,0.15); border-color: var(--accent2); color: var(--accent2); }\n.vou-btn.volta.on { background: rgba(245,158,11,0.15); border-color: var(--accent); color: var(--accent); }\n.vou-btn.nao.on { background: rgba(239,68,68,0.15); border-color: var(--red); color: var(--red); }\n.track-card { background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04)); border-color: rgba(59,130,246,0.3); }\n.estrela { font-size: 38px; cursor: pointer; color: #f59e0b; line-height: 1; user-select: none; transition: transform 0.1s; }\n.estrela:active { transform: scale(1.2); }\n.track-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--accent2); color: #fff; border: none; border-radius: 12px; padding: 14px; font-weight: 700; font-family: 'Barlow'; font-size: 15px; cursor: pointer; text-decoration: none; }\n.track-off { text-align: center; color: var(--muted); font-size: 13px; padding: 6px; }\n.live-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--green); display: inline-block; animation: pulse 1.5s infinite; }\n@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }\n.chat-wrap { padding: 0; }\n.chat-msgs { padding: 16px; min-height: calc(100vh - 270px); display: flex; flex-direction: column; gap: 10px; }\n.msg { max-width: 80%; padding: 10px 13px; border-radius: 14px; font-size: 14px; line-height: 1.4; }\n.msg .meta { font-size: 11px; margin-bottom: 3px; font-weight: 700; }\n.msg .time { font-size: 10px; color: var(--muted); margin-top: 3px; text-align: right; }\n.msg.gestor { align-self: flex-start; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); }\n.msg.gestor .meta { color: var(--accent); }\n.msg.motorista { align-self: flex-start; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); }\n.msg.motorista .meta { color: var(--accent2); }\n.msg.passageiro { align-self: flex-start; background: var(--surface2); border: 1px solid var(--border); }\n.msg.passageiro .meta { color: var(--muted); }\n.msg.eu { align-self: flex-end; background: var(--surface3); border: 1px solid var(--border); }\n.msg.eu .meta { color: var(--green); text-align: right; }\n.msg.sistema { align-self: center; background: transparent; color: var(--muted); font-size: 12px; text-align: center; max-width: 90%; }\n.msg.loc { align-self: flex-start; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); }\n.msg.loc .meta { color: var(--green); }\n.chat-input { position: sticky; bottom: 60px; background: var(--surface); border-top: 1px solid var(--border); padding: 10px; display: flex; gap: 8px; }\n.chat-input input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 22px; padding: 11px 16px; color: var(--text); font-size: 14px; font-family: inherit; }\n.chat-input input:focus { outline: none; border-color: var(--accent); }\n.chat-input button { background: var(--accent); border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 18px; cursor: pointer; flex-shrink: 0; }\n.aviso { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 10px; padding: 14px; margin-bottom: 12px; }\n.aviso .top { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 6px; }\n.aviso .txt { font-size: 14px; line-height: 1.5; }\n.aviso.pdf { border-left-color: var(--accent2); }\n.bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 600px; background: var(--surface); border-top: 1px solid var(--border); display: flex; z-index: 50; }\n.bnav { flex: 1; padding: 9px 4px 7px; text-align: center; background: none; border: none; color: var(--muted); cursor: pointer; position: relative; }\n.bnav .ic { font-size: 21px; display: block; }\n.bnav .lb { font-size: 10px; font-family: 'Barlow'; font-weight: 700; margin-top: 1px; }\n.bnav.active { color: var(--accent); }\n.bnav .dot { position: absolute; top: 6px; right: 28%; width: 9px; height: 9px; background: var(--red); border-radius: 50%; }\n.loading { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; color:var(--muted); }\n.spin { width:38px; height:38px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:rot 0.8s linear infinite; }\n@keyframes rot { to { transform: rotate(360deg); } }\n/* ===== Notificação in-app (banner) ===== */\n#notifBanner { position: fixed; top: 12px; left: 50%; transform: translateX(-50%) translateY(-150%); width: calc(100% - 24px); max-width: 560px; background: var(--surface); border: 1px solid var(--accent); border-left: 5px solid var(--accent); border-radius: 12px; padding: 12px 14px; z-index: 99999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px; transition: transform 0.35s cubic-bezier(.2,.8,.2,1); cursor: pointer; }\n#notifBanner.show { transform: translateX(-50%) translateY(0); }\n#notifBanner .nf-ic { font-size: 24px; flex-shrink: 0; }\n#notifBanner .nf-tt { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'Barlow'; }\n#notifBanner .nf-tx { font-size: 12px; color: var(--muted); margin-top: 2px; }\n#notifBanner .nf-cl { margin-left: auto; color: var(--muted); font-size: 18px; background: none; border: none; cursor: pointer; flex-shrink: 0; }\n\n\n/* Safe-area: evita que o cabecalho fique atras da barra de status do celular */\n.app-header { padding-top: calc(14px + env(safe-area-inset-top)) !important; }\n\n/* --- Icones em SVG (fase 2: profissionalizacao) --- */\n.login-logo .ico svg { width: 54px; height: 54px; color: var(--accent); }\n.app-header .logout svg { width: 20px; height: 20px; display: block; }\n.bnav .ic svg { width: 22px; height: 22px; display: block; margin: 0 auto; }\n.chat-send button svg, #viewChat button svg { width: 20px; height: 20px; display: block; }\n.nf-ic:empty { display: none; }\n\n.marca-bar { display:flex; align-items:center; gap:8px; padding: calc(10px + env(safe-area-inset-top)) 16px 8px; }\n.marca-bar .mb-ico { display:flex; color: var(--accent); }\n.marca-bar .mb-ico svg { width:20px; height:20px; }\n.marca-bar .mb-nome { font-family:'Barlow',sans-serif; font-weight:800; font-size:15px; letter-spacing:.5px; color: var(--accent); }\n.marca-bar .mb-sub { font-size:11px; color: var(--muted); letter-spacing:.6px; text-transform:uppercase; }\n.marca-bar + .app-header { padding-top: 10px !important; }\n";

const HTML_MOTOR = "\n<!-- Banner de notificação in-app -->\n<div id=\"notifBanner\" onclick=\"notifClick()\">\n  <span class=\"nf-ic\" id=\"notifIc\"></span>\n  <div style=\"flex:1;min-width:0\">\n    <div class=\"nf-tt\" id=\"notifTt\">Notificação</div>\n    <div class=\"nf-tx\" id=\"notifTx\"></div>\n  </div>\n  <button class=\"nf-cl\" onclick=\"event.stopPropagation();fecharNotif()\">✕</button>\n</div>\n\n<div id=\"loadingScreen\" class=\"loading\">\n  <div class=\"spin\"></div>\n  <div>Carregando...</div>\n</div>\n\n<div id=\"loginScreen\" class=\"login-wrap hidden\">\n  <div class=\"login-logo\">\n    <div class=\"ico\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 16V8a1 1 0 0 1 1-1h10v9\"/><path d=\"M13 10h4l3 3.5V16\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/><path d=\"M9 17h6\"/></svg></div>\n    <div class=\"brand\" id=\"brandLogin\"></div>\n    <div class=\"sub\">Transporte · Passageiro</div>\n  </div>\n  <div class=\"login-card\">\n    <h2>Entrar</h2>\n    <p>Digite seu telefone cadastrado para acessar sua linha.</p>\n    <label class=\"field-label\">Telefone</label>\n    <input class=\"input\" id=\"loginTel\" type=\"tel\" placeholder=\"(15) 99999-9999\" inputmode=\"tel\" onkeydown=\"if(event.key==='Enter'){event.preventDefault();fazerLogin();}\">\n    <button class=\"btn\" id=\"loginBtn\" onclick=\"fazerLogin()\">Entrar</button>\n    <div class=\"login-err\" id=\"loginErr\">Telefone não encontrado. Confira com o gestor.</div>\n  </div>\n</div>\n\n<div id=\"appScreen\" class=\"hidden\">\n  <div class=\"marca-bar\"><span class=\"mb-ico\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 16V8a1 1 0 0 1 1-1h10v9\"/><path d=\"M13 10h4l3 3.5V16\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/><path d=\"M9 17h6\"/></svg></span><span class=\"mb-nome\" id=\"brandApp\"></span><span class=\"mb-sub\">Passageiro</span></div>\n  <div class=\"app-header\">\n    <div class=\"ava\" id=\"hAva\">M</div>\n    <div class=\"who\">\n      <div class=\"nm\" id=\"hNome\">—</div>\n      <div class=\"ln\" id=\"hLinha\">—</div>\n    </div>\n    <button class=\"logout\" onclick=\"logout()\" title=\"Sair\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4\"/><path d=\"M15 8l4 4-4 4\"/><path d=\"M19 12H9\"/></svg></button>\n  </div>\n\n  <div id=\"viewInicio\" class=\"view\">\n    <div class=\"card\" id=\"rotaExtraCard\" style=\"display:none;border-color:rgba(236,72,153,0.5);background:linear-gradient(135deg,rgba(236,72,153,0.12),rgba(236,72,153,0.03))\">\n      <div class=\"card-lbl\" style=\"color:#ec4899\">Rota extra de hoje</div>\n      <div id=\"rotaExtraConteudo\"></div>\n    </div>\n    <div class=\"card track-card\">\n      <div class=\"card-lbl\">Localização da van</div>\n      <div id=\"trackArea\"><div class=\"track-off\">O motorista ainda não compartilhou a localização hoje.</div></div>\n    </div>\n\n    <div class=\"card\" id=\"horarioDiaCard\" style=\"display:none;border-color:rgba(245,158,11,0.4);background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.03))\">\n      <div class=\"card-lbl\" style=\"color:var(--accent)\">Horário especial de hoje</div>\n      <div id=\"horarioDiaConteudo\"></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-lbl\">Você vai hoje?</div>\n      <div class=\"vou-wrap\" style=\"flex-wrap:wrap\">\n        <button class=\"vou-btn sim\" id=\"btnVou\" onclick=\"marcarPresenca('ambos')\" style=\"flex:1 1 100%\">Vou (ida e volta)</button>\n        <button class=\"vou-btn ida\" id=\"btnIda\" onclick=\"marcarPresenca('ida')\" style=\"flex:1 1 45%\">→ Só ida</button>\n        <button class=\"vou-btn volta\" id=\"btnVolta\" onclick=\"marcarPresenca('volta')\" style=\"flex:1 1 45%\">← Só volta</button>\n        <button class=\"vou-btn nao\" id=\"btnNaoVou\" onclick=\"marcarPresenca('nao')\" style=\"flex:1 1 100%\">Não vou hoje</button>\n      </div>\n      <div id=\"presencaMsg\" style=\"font-size:12px;color:var(--muted);margin-top:10px;text-align:center\"></div>\n    </div>\n\n    <div class=\"card\" id=\"avaliacaoCard\">\n      <div class=\"card-lbl\">Avalie sua viagem de hoje</div>\n      <div id=\"avaliacaoForm\">\n        <div style=\"display:flex;justify-content:center;gap:8px;margin:8px 0\" id=\"estrelas\">\n          <span class=\"estrela\" data-v=\"1\" onclick=\"selecionarEstrela(1)\">☆</span>\n          <span class=\"estrela\" data-v=\"2\" onclick=\"selecionarEstrela(2)\">☆</span>\n          <span class=\"estrela\" data-v=\"3\" onclick=\"selecionarEstrela(3)\">☆</span>\n          <span class=\"estrela\" data-v=\"4\" onclick=\"selecionarEstrela(4)\">☆</span>\n          <span class=\"estrela\" data-v=\"5\" onclick=\"selecionarEstrela(5)\">☆</span>\n        </div>\n        <div id=\"avJustificativaWrap\" style=\"display:none;margin-top:8px\">\n          <textarea class=\"input\" id=\"avJustificativa\" rows=\"2\" placeholder=\"Conte o que podemos melhorar...\" style=\"resize:vertical;font-size:14px\"></textarea>\n        </div>\n        <button class=\"btn\" style=\"margin-top:10px\" onclick=\"enviarAvaliacao()\" id=\"btnAvaliar\" disabled>Enviar avaliação</button>\n      </div>\n      <div id=\"avaliacaoFeita\" style=\"display:none;text-align:center;padding:8px\">\n        <div style=\"font-size:15px;font-weight:700;color:var(--green)\">Obrigado pela avaliação!</div>\n        <div style=\"font-size:13px;color:var(--muted);margin-top:4px\" id=\"avaliacaoResumo\"></div>\n      </div>\n    </div>\n\n    <div class=\"card\" id=\"feriasCard\">\n      <div class=\"card-lbl\">Férias / afastamento</div>\n      <div id=\"feriasAtiva\" style=\"display:none\">\n        <div style=\"background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:12px;text-align:center\">\n          <div style=\"font-weight:700;color:var(--accent);font-size:15px\" id=\"feriasLabel\">—</div>\n          <div style=\"font-size:12px;color:var(--muted);margin-top:4px\">Sua vaga na linha está mantida. Você não embarca neste período.</div>\n        </div>\n        <button class=\"vou-btn\" style=\"margin-top:10px;width:100%\" onclick=\"cancelarFerias()\">Cancelar período</button>\n      </div>\n      <div id=\"feriasForm\">\n        <div style=\"font-size:12px;color:var(--muted);margin-bottom:10px\">Vai se ausentar por um período? Informe as datas e sua vaga fica reservada.</div>\n        <div style=\"display:flex;gap:10px\">\n          <div style=\"flex:1\">\n            <label class=\"field-label\">Início</label>\n            <input class=\"input\" type=\"date\" id=\"feriasInicio\" style=\"font-size:14px;padding:10px\">\n          </div>\n          <div style=\"flex:1\">\n            <label class=\"field-label\">Retorno</label>\n            <input class=\"input\" type=\"date\" id=\"feriasFim\" style=\"font-size:14px;padding:10px\">\n          </div>\n        </div>\n        <button class=\"btn\" onclick=\"salvarFerias()\">Registrar período</button>\n      </div>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-lbl\">Seu embarque</div>\n      <div style=\"display:flex;justify-content:space-between;align-items:flex-start;gap:12px\">\n        <div>\n          <div style=\"font-weight:700;font-size:15px\" id=\"iEmbarque\">—</div>\n          <div style=\"font-size:13px;color:var(--muted);margin-top:2px\" id=\"iBairro\">—</div>\n        </div>\n        <div style=\"text-align:right\">\n          <div class=\"big\" id=\"iHorario\">—</div>\n          <div style=\"font-size:11px;color:var(--muted)\">horário</div>\n        </div>\n      </div>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-lbl\">Sua linha hoje</div>\n      <div style=\"display:flex;align-items:center;gap:12px\">\n        <div id=\"iBadge\" style=\"width:44px;height:44px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;font-family:'Barlow'\">—</div>\n        <div style=\"flex:1\">\n          <div style=\"font-weight:700\" id=\"iLinhaTurno\">—</div>\n          <div style=\"font-size:13px;color:var(--muted)\" id=\"iMotorista\">Motorista: —</div>\n        </div>\n      </div>\n      <a id=\"iMotoWhats\" href=\"#\" target=\"_blank\" style=\"display:none;align-items:center;justify-content:center;gap:8px;margin-top:12px;background:rgba(37,211,102,0.12);color:#25D366;border:1px solid rgba(37,211,102,0.3);border-radius:10px;padding:11px;font-weight:700;font-family:'Barlow';font-size:14px;text-decoration:none\">Falar com o motorista no WhatsApp</a>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-lbl\">Quem vai hoje · Linha <span id=\"qvLinha\">—</span></div>\n      <div id=\"quemVaiResumo\" style=\"display:flex;gap:10px;margin-bottom:12px\"></div>\n      <div id=\"quemVaiListas\"></div>\n    </div>\n  </div>\n\n  <div id=\"viewChat\" class=\"view chat-wrap hidden\">\n    <div class=\"chat-msgs\" id=\"chatMsgs\"></div>\n    <div class=\"chat-input\">\n      <input id=\"chatInput\" placeholder=\"Mensagem para a linha...\" onkeypress=\"if(event.key==='Enter')enviarMsg()\">\n      <button onclick=\"enviarMsg()\" title=\"Enviar\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12 20 5l-7 15-2.5-6.5L4 12Z\"/></svg></button>\n    </div>\n  </div>\n\n  <div id=\"viewAvisos\" class=\"view hidden\">\n    <div id=\"avisosList\"></div>\n  </div>\n  <div id=\"viewContatos\" class=\"view hidden\">\n    <div class=\"card\">\n      <label class=\"field-label\">Fale com a gente</label>\n      <div style=\"font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.5\">Precisa de ajuda ou quer avisar algo? Fale direto pelo WhatsApp.</div>\n      <div id=\"contatosBtns\"></div>\n      <div id=\"contatosVazio\" style=\"display:none;font-size:13px;color:var(--muted);text-align:center;padding:16px\">Nenhum contato configurado ainda. Fale com o gestor.</div>\n    </div>\n  </div>\n</div>\n\n<div id=\"bottomNav\" class=\"bottom-nav hidden\">\n  <button class=\"bnav active\" id=\"navInicio\" onclick=\"irPara('inicio')\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10.5 12 4l9 6.5\"/><path d=\"M5.5 9.5V20h13V9.5\"/><path d=\"M10 20v-5h4v5\"/></svg></span><span class=\"lb\">Início</span></button>\n  <button class=\"bnav\" id=\"navChat\" onclick=\"irPara('chat')\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 12a7 7 0 0 1-7 7H8l-4 3v-4.5A7 7 0 0 1 4 12v-.5A6.5 6.5 0 0 1 10.5 5h3A6.5 6.5 0 0 1 20 11.5Z\"/></svg></span><span class=\"lb\">Chat</span><span class=\"dot hidden\" id=\"dotChat\"></span></button>\n  <button class=\"bnav\" id=\"navAvisos\" onclick=\"irPara('avisos')\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 10v4h3l6 4V6l-6 4H4Z\"/><path d=\"M17 9.5a4 4 0 0 1 0 5\"/><path d=\"M19.5 7a7 7 0 0 1 0 10\"/></svg></span><span class=\"lb\">Avisos</span><span class=\"dot hidden\" id=\"dotAvisos\"></span></button>\n  <button class=\"bnav\" id=\"navContatos\" onclick=\"irPara('contatos')\"><span class=\"ic\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 4h3.5l1.8 4-2.2 1.6a11 11 0 0 0 5.3 5.3L15 12.7l4 1.8V18a2 2 0 0 1-2.2 2A15 15 0 0 1 4 6.2 2 2 0 0 1 5 4Z\"/></svg></span><span class=\"lb\">Contatos</span></button>\n</div>\n\n";

const C = window.CLIENTE_CONFIG;

function bloqueio(titulo, msg) {
  document.body.innerHTML = '<div style="max-width:560px;margin:80px auto;padding:32px;font-family:sans-serif;background:#1a1208;border:2px solid #f59e0b;border-radius:14px;color:#fff;text-align:center"><div style="font-size:48px;margin-bottom:12px">\u26A0\uFE0F</div><h2 style="color:#f59e0b">' + titulo + '</h2><p>' + msg + '</p></div>';
}

if (!C || !C.fb || !C.clienteId) {
  bloqueio('Configura\u00e7\u00e3o ausente', 'Esta p\u00e1gina n\u00e3o definiu window.CLIENTE_CONFIG. Verifique a casca da opera\u00e7\u00e3o.');
  throw new Error('CLIENTE_CONFIG ausente');
}

// TRAVA DE PASTA: a casca declara em qual caminho deve viver.
if (C.pathPrefix && location.protocol !== 'file:' && location.pathname.indexOf(C.pathPrefix) !== 0) {
  bloqueio('Arquivo no lugar errado', 'Esta casca \u00e9 da opera\u00e7\u00e3o <b>' + C.clienteId.toUpperCase() + '</b> e deveria estar em <b>' + C.pathPrefix + '</b>, mas foi aberta em <b>' + location.pathname + '</b>. Bloqueado por seguran\u00e7a.');
  throw new Error('pasta errada');
}

document.title = (C.empresaNome || C.marca) + ' \u2014 Portal temvia \u2014 Passageiro';
document.head.insertAdjacentHTML('beforeend',
  '<link rel="icon" type="image/png" sizes="32x32" href="/marca/favicon-32.png">' +
  '<link rel="icon" type="image/png" sizes="192x192" href="/marca/icon-192.png">' +
  '<link rel="apple-touch-icon" href="/marca/icon-192.png">' +
  '<meta name="apple-mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
  '<meta name="theme-color" content="#0d1117">' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">' +
  '<style>' + CSS_MOTOR + '</style>');
document.body.innerHTML = HTML_MOTOR;
var _marca = C.marcaUpper || (C.marca || '').toUpperCase();
['brandLogin', 'brandApp'].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.textContent = _marca;
});

// Firebase carregado DEPOIS de desenhar a tela: se o CDN estiver fora do ar,
// o passageiro ve a tela e um aviso, em vez de uma pagina em branco.
let initializeApp, getFirestore, doc, getDoc, setDoc, onSnapshot;
try {
  ({ initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'));
  ({ getFirestore, doc, getDoc, setDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'));
} catch (e) {
  const ld = document.getElementById('loadingScreen');
  if (ld) ld.innerHTML = '<div style="text-align:center;padding:30px;color:#e6edf3;font-family:sans-serif">' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:8px">Sem conexao com o servidor</div>' +
    '<div style="font-size:13px;color:#8b949e">Verifique a internet e recarregue a pagina.</div></div>';
  throw e;
}

const FB_CONFIG = C.fb;

// ============================================================
// TRAVA DE IDENTIDADE (proteção multi-cliente)
// CLIENTE_ID = nome da coleção própria deste cliente no Firestore.
// PROJETO_ESPERADO = projectId do Firebase que ESTE arquivo deve usar.
// Se aberto no banco errado, bloqueia gravação e avisa.
// ============================================================
const CLIENTE_ID = C.clienteId;
const PROJETO_ESPERADO = C.projetoEsperado;
let TRAVA_OK = true;
function verificarIdentidade() {
  const real = (FB_CONFIG && FB_CONFIG.projectId) || '';
  if (real !== PROJETO_ESPERADO) {
    TRAVA_OK = false;
    try {
      document.body.innerHTML = '<div style="max-width:560px;margin:80px auto;padding:32px;font-family:sans-serif;background:#1a1208;border:2px solid #f59e0b;border-radius:14px;color:#fff;text-align:center"><div style="font-size:48px;margin-bottom:12px">⚠️</div><h2 style="color:#f59e0b">Arquivo no lugar errado</h2><p>Este arquivo é do cliente <b>' + CLIENTE_ID.toUpperCase() + '</b> (projeto <b>' + PROJETO_ESPERADO + '</b>), mas está conectado ao projeto <b>' + real + '</b>.</p><p style="color:#fca5a5">Bloqueado por segurança para NÃO sobrescrever dados de outro cliente.</p></div>';
    } catch(e) {}
    return false;
  }
  return true;
}


if (!verificarIdentidade()) { throw new Error("Identidade nao confere"); }

// Handlers usados por onclick no HTML: em modulo ES precisam ser expostos.
window.fecharNotif = fecharNotif;
window.notifClick  = notifClick;


const fbApp = initializeApp(FB_CONFIG);
const db = getFirestore(fbApp);

let DATA = [], MOTORISTAS = [];
let PASSAGEIRO = null, ROTA = null, CHAVE = null;
let ROTAS_DIA = [];          // rotas extras publicadas
let MINHA_ROTA_EXTRA = null; // rota extra do passageiro hoje (se houver)
let presencaHoje = null;
let temMsgNova = false, temAvisoNovo = false;
let _ultimoHorarioNotif = null;
let unsubChat = null, unsubPres = null, unsubAvisos = null, unsubTrack = null;
let chatVisto = 0, avisosVisto = 0, viewAtual = 'inicio';
const STORAGE_KEY = C.storageKey;

init();

async function init() {
  try {
    const snap = await getDoc(doc(db, CLIENTE_ID, 'dados'));
    if (snap.exists()) {
      DATA = snap.data().DATA || [];
      MOTORISTAS = snap.data().MOTORISTAS || [];
    }
  } catch(e) { console.warn('Erro ao carregar dados:', e); }

  // Carregar rotas extras publicadas (do dia)
  try {
    const snapR = await getDoc(doc(db, CLIENTE_ID, 'rotas_do_dia'));
    if (snapR.exists()) ROTAS_DIA = snapR.data().lista || [];
  } catch(e) { console.warn('Erro ao carregar rotas do dia:', e); }

  // Carregar contatos dos gestores (config da empresa)
  try {
    const snapC = await getDoc(doc(db, CLIENTE_ID, 'config'));
    if (snapC.exists()) {
      const emp = snapC.data().empresa || {};
      WHATS_CLIENTE = emp.whatsCliente || '';
      WHATS_REDENTOR = emp.whatsRedentor || '';
      NOME_EMPRESA = emp.nome || NOME_EMPRESA;
    }
  } catch(e) { console.warn('Erro ao carregar contatos:', e); }

  const telSalvo = localStorage.getItem(STORAGE_KEY);
  document.getElementById('loadingScreen').classList.add('hidden');
  if (telSalvo && buscarPassageiro(telSalvo)) iniciarApp();
  else document.getElementById('loginScreen').classList.remove('hidden');
}

function soDigitos(s){ return (s||'').replace(/\D/g,''); }

// Rota extra deixa de aparecer para o passageiro se:
// 1) o motorista marcou como concluída; ou
// 2) já passaram 2 horas do horário de saída (caso o motorista esqueça de concluir).
function rotaExtraOculta(rd) {
  if (rd.concluida) return true;
  const saida = rd.departure; // "HH:MM"
  if (rd.data && /^\d{2}:\d{2}$/.test(saida || '')) {
    const dtSaida = new Date(rd.data + 'T' + saida + ':00');
    if (!isNaN(dtSaida.getTime())) {
      const limite = dtSaida.getTime() + 2 * 60 * 60 * 1000; // +2h
      if (Date.now() > limite) return true;
    }
  }
  return false;
}

let _vigiaRotaExtraTimer = null;
let _unsubRotasDia = null;
function esconderRotaExtra() {
  const card = document.getElementById('rotaExtraCard');
  if (card) card.style.display = 'none';
  MINHA_ROTA_EXTRA = null;
  if (_vigiaRotaExtraTimer) { clearInterval(_vigiaRotaExtraTimer); _vigiaRotaExtraTimer = null; }
  if (_unsubRotasDia) { try { _unsubRotasDia(); } catch(e){} _unsubRotasDia = null; }
  // Se o passageiro também tem linha fixa, recarrega a tela normal dela
  if (ROTA) { try { iniciarApp(); } catch(e){} }
}
function vigiarRotaExtra(rotaId) {
  // 1) Tempo: a cada 60s, checa se passou 2h da saída
  if (_vigiaRotaExtraTimer) clearInterval(_vigiaRotaExtraTimer);
  _vigiaRotaExtraTimer = setInterval(() => {
    const rd = (ROTAS_DIA || []).find(r => r.id === rotaId);
    if (!rd || rotaExtraOculta(rd)) esconderRotaExtra();
  }, 60000);
  // 2) Conclusão pelo motorista: escuta rotas_do_dia em tempo real
  try {
    const ref = doc(db, CLIENTE_ID, 'rotas_do_dia');
    _unsubRotasDia = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      ROTAS_DIA = snap.data().lista || [];
      const rd = ROTAS_DIA.find(r => r.id === rotaId);
      if (!rd || rotaExtraOculta(rd)) esconderRotaExtra();
    });
  } catch(e) { /* sem tempo real: o timer ainda cobre a expiração */ }
}

// Quem pode entrar no app: ativo, ferias e afastado (continuam sendo funcionarios).
// Fora: 'desligado' (saiu da empresa) e 'sem-rota' (ainda nao alocado - o app depende de linha/turno).
const STATUS_PODE_ENTRAR = ['ativo','ferias','afastado'];

function buscarPassageiro(telRaw) {
  const tel = soDigitos(telRaw);
  if (tel.length < 8) return false;
  let achou = false;
  for (const rota of DATA) {
    for (const p of rota.passageiros) {
      if (!STATUS_PODE_ENTRAR.includes(p.status)) continue;
      const pt = soDigitos(p.telefone);
      if (pt && (pt === tel || pt.slice(-8) === tel.slice(-8))) {
        PASSAGEIRO = {
          nome: p.nome, telefone: p.telefone,
          linha: rota.linha, turno: rota.turno,
          embarque: p.embarque || p.endereco || '',
          bairro: p.bairro || '', cidade: p.cidade || 'Sorocaba',
          horario: p.horario || '',
          lat: (p.lat != null ? p.lat : null), lng: (p.lng != null ? p.lng : null)
        };
        ROTA = rota;
        CHAVE = String(rota.linha) + '_' + rota.turno;
        achou = true;
        break;
      }
    }
    if (achou) break;
  }
  // Verificar se está numa rota extra publicada para HOJE
  const hoje = hojeLocal();
  MINHA_ROTA_EXTRA = null;
  for (const rd of ROTAS_DIA) {
    if (rd.data !== hoje) continue;
    if (rotaExtraOculta(rd)) continue; // concluída pelo motorista OU já passou 2h da saída
    const parada = (rd.paradas||[]).find(par => {
      const pt = soDigitos(par.telefone);
      return pt && (pt === tel || pt.slice(-8) === tel.slice(-8));
    });
    if (parada) {
      MINHA_ROTA_EXTRA = { rota: rd, parada };
      // Se o passageiro só existe na rota extra (sem linha fixa), montar PASSAGEIRO a partir dela
      if (!achou) {
        PASSAGEIRO = {
          nome: parada.nome, telefone: parada.telefone,
          linha: '—', turno: '—',
          embarque: parada.embarque || '', bairro: parada.bairro || '',
          cidade: parada.cidade || 'Sorocaba', horario: parada.horario || ''
        };
        CHAVE = 'extra_' + rd.id;
        achou = true;
      }
      break;
    }
  }
  return achou;
}

window.fazerLogin = function() {
  const tel = document.getElementById('loginTel').value;
  if (buscarPassageiro(tel)) {
    localStorage.setItem(STORAGE_KEY, soDigitos(tel));
    document.getElementById('loginScreen').classList.add('hidden');
    iniciarApp();
  } else {
    document.getElementById('loginErr').style.display = 'block';
  }
};

window.logout = function() {
  localStorage.removeItem(STORAGE_KEY);
  if (unsubChat) unsubChat();
  if (unsubPres) unsubPres();
  if (unsubAvisos) unsubAvisos();
  if (unsubTrack) unsubTrack();
  if (unsubFerias) unsubFerias();
  if (unsubHorario) unsubHorario();
  PASSAGEIRO = null;
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('bottomNav').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginTel').value = '';
  document.getElementById('loginErr').style.display = 'none';
};

function iniciarApp() {
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('bottomNav').classList.remove('hidden');

  document.getElementById('hAva').textContent = PASSAGEIRO.nome.charAt(0);
  document.getElementById('hNome').textContent = PASSAGEIRO.nome;

  if (MINHA_ROTA_EXTRA) {
    // ===== MODO ROTA EXTRA =====
    const rd = MINHA_ROTA_EXTRA.rota;
    const par = MINHA_ROTA_EXTRA.parada;
    CHAVE = 'extra_' + rd.id; // chat e rastreador próprios da rota extra
    document.getElementById('hLinha').textContent = 'Rota extra · hoje';

    // Card de rota extra em destaque
    document.getElementById('rotaExtraCard').style.display = 'block';
    const mObjE = MOTORISTAS.find(m => m.nome === rd.motorista);
    let waBtn = '';
    if (mObjE && mObjE.tel) waBtn = '<a href="https://wa.me/55' + soDigitos(mObjE.tel) + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;background:rgba(37,211,102,0.12);color:#25D366;border:1px solid rgba(37,211,102,0.3);border-radius:10px;padding:11px;font-weight:700;font-family:Barlow;font-size:14px;text-decoration:none">Falar com o motorista</a>';
    document.getElementById('rotaExtraConteudo').innerHTML =
      '<div style="font-weight:800;font-size:17px;font-family:Barlow;margin-bottom:8px">' + esc(rd.nomeRota || 'Rota Extra') + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:8px">' +
        '<div><div style="font-size:11px;color:var(--muted)">Seu embarque</div><div style="font-weight:700;font-size:14px">' + esc(par.embarque || '—') + '</div>' + (par.bairro?'<div style="font-size:12px;color:var(--muted)">'+esc(par.bairro)+'</div>':'') + '</div>' +
        '<div style="text-align:right"><div style="font-size:26px;font-weight:800;font-family:Barlow;color:#ec4899">' + (par.horario||'--:--') + '</div><div style="font-size:10px;color:var(--muted)">horário</div></div>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--muted)">Motorista: <b style="color:var(--text)">' + esc(rd.motorista || '—') + '</b></div>' +
      waBtn;

    // Esconder os cards de linha fixa (presença, embarque fixo, linha, quem vai)
    document.querySelectorAll('#viewInicio > .card').forEach(c => {
      if (c.id !== 'rotaExtraCard' && c.id !== 'horarioDiaCard' && !c.classList.contains('track-card')) {
        c.style.display = 'none';
      }
    });
    // também esconder card de férias (não aplicável hoje)
    const fc = document.getElementById('feriasCard'); if (fc) fc.style.display = 'none';

    escutarChat();      // chat da rota extra (chave extra_<id>)
    escutarRastreador(); // rastreador da rota extra
    escutarAvisos();
    vigiarRotaExtra(rd.id); // some se motorista concluir ou passar 2h da saída
    return;
  }

  // ===== MODO LINHA FIXA (normal) =====
  const motorista = (ROTA.motorista && ROTA.motorista !== 'A definir') ? ROTA.motorista : '—';
  const mObj = MOTORISTAS.find(m => m.nome === motorista);
  document.getElementById('hLinha').textContent = 'Linha ' + PASSAGEIRO.linha + ' · ' + PASSAGEIRO.turno + ' Turno';
  document.getElementById('iEmbarque').textContent = PASSAGEIRO.embarque || '—';
  document.getElementById('iBairro').textContent = PASSAGEIRO.bairro || '';
  document.getElementById('iHorario').textContent = PASSAGEIRO.horario || '—';
  document.getElementById('iBadge').textContent = PASSAGEIRO.linha;
  document.getElementById('iLinhaTurno').textContent = 'Linha ' + PASSAGEIRO.linha + ' — ' + PASSAGEIRO.turno + ' Turno';
  document.getElementById('iMotorista').textContent = 'Motorista: ' + motorista;
  document.getElementById('qvLinha').textContent = PASSAGEIRO.linha;
  if (mObj && mObj.tel) {
    const wa = document.getElementById('iMotoWhats');
    wa.href = 'https://wa.me/55' + soDigitos(mObj.tel);
    wa.style.display = 'flex';
  }
  escutarChat();
  escutarPresencas();
  escutarAvisos();
  escutarFerias();
  escutarRastreador();
  escutarHorarioDia();
  verificarAvaliacaoHoje();
}

function rodadaAtual() {
  const agora = new Date();
  const hoje = hojeLocal(agora);
  if (MINHA_ROTA_EXTRA) return hoje; // rota extra é sempre do dia
  // Horário de corte por turno (a resposta passa a valer para o dia seguinte a partir daqui).
  // ADM encerra a jornada às 17:40, por isso usa hora:minuto.
  const limites = { '1°': '12:00', '2°': '20:00', '3°': '23:00', 'ADM': '17:40' };
  const lim = limites[PASSAGEIRO.turno] || '23:00';
  const [hLim, mLim] = lim.split(':').map(Number);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  if (minutosAgora >= hLim * 60 + mLim) return hojeLocal(agora, 1);
  return hoje;
}

let WHATS_CLIENTE = '', WHATS_REDENTOR = '', NOME_EMPRESA = 'a empresa';

function soDigitosTel(t){ return (t||'').replace(/\D/g,''); }

function montarContatos() {
  const cont = document.getElementById('contatosBtns');
  const vazio = document.getElementById('contatosVazio');
  if (!cont) return;
  let html = '';
  const btn = (label, tel, msg) => {
    const n = soDigitosTel(tel);
    if (!n) return '';
    const num = n.length <= 11 ? '55' + n : n; // adiciona DDI 55 se vier sem
    const texto = encodeURIComponent(msg);
    return '<a href="https://wa.me/' + num + '?text=' + texto + '" target="_blank" '
      + 'style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;'
      + 'background:rgba(37,211,102,0.12);color:#25D366;border:1px solid rgba(37,211,102,0.3);'
      + 'border-radius:10px;padding:13px;font-weight:700;font-family:Barlow,sans-serif;font-size:14px;text-decoration:none">'
      + label + '</a>';
  };
  html += btn(C.contatoCliente.rotulo, WHATS_CLIENTE, C.contatoCliente.mensagem);
  html += btn(C.contatoTransportadora.rotulo, WHATS_REDENTOR, C.contatoTransportadora.mensagem);
  cont.innerHTML = html;
  if (vazio) vazio.style.display = html ? 'none' : 'block';
}

window.irPara = function(view) {
  viewAtual = view;
  ['inicio','chat','avisos','contatos'].forEach(v => {
    document.getElementById('view' + cap(v)).classList.toggle('hidden', v !== view);
    document.getElementById('nav' + cap(v)).classList.toggle('active', v === view);
  });
  if (view === 'chat') { temMsgNova = false; setTimeout(()=>{ const b=document.getElementById('chatMsgs'); b.scrollTop=b.scrollHeight; },50); }
  if (view === 'avisos') { temAvisoNovo = false; }
  if (view === 'contatos') { montarContatos(); }
  atualizarBadges();
};
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function atualizarBadges() {
  document.getElementById('dotChat').classList.toggle('hidden', !temMsgNova);
  document.getElementById('dotAvisos').classList.toggle('hidden', !temAvisoNovo);
}

// ===== NOTIFICAÇÃO IN-APP (som + banner) =====
let _notifTimer = null;
let _notifAcao = null;
let _audioCtx = null;

function tocarSom() {
  try {
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    const notas = [880, 1175]; // dois "beeps" agradáveis
    notas.forEach((freq, i) => {
      const osc = _audioCtx.createOscillator();
      const gain = _audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = _audioCtx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      osc.connect(gain); gain.connect(_audioCtx.destination);
      osc.start(t0); osc.stop(t0 + 0.18);
    });
  } catch(e) { /* áudio bloqueado até o 1º toque do usuário; tudo bem */ }
}

function vibrar() {
  try { if (navigator.vibrate) navigator.vibrate([120, 60, 120]); } catch(e){}
}

// notificar({icone, titulo, texto, acao}) — acao é função opcional ao tocar no banner
function notificar(opts) {
  const b = document.getElementById('notifBanner');
  document.getElementById('notifIc').textContent = opts.icone || '';
  document.getElementById('notifTt').textContent = opts.titulo || 'Notificação';
  document.getElementById('notifTx').textContent = opts.texto || '';
  _notifAcao = opts.acao || null;
  b.classList.add('show');
  tocarSom();
  vibrar();
  if (_notifTimer) clearTimeout(_notifTimer);
  _notifTimer = setTimeout(fecharNotif, 6000);
}

function fecharNotif() {
  document.getElementById('notifBanner').classList.remove('show');
}

function notifClick() {
  const acao = _notifAcao;
  fecharNotif();
  if (typeof acao === 'function') acao();
}


// ---- FÉRIAS / AFASTAMENTO ----
let unsubFerias = null;
let MINHA_FERIAS = null;

// ---- AVALIAÇÃO DA VIAGEM ----
let avEstrelas = 0;

window.selecionarEstrela = function(v) {
  avEstrelas = v;
  document.querySelectorAll('#estrelas .estrela').forEach(e => {
    e.textContent = parseInt(e.dataset.v) <= v ? '★' : '☆';
  });
  // 4 ou menos exige justificativa
  document.getElementById('avJustificativaWrap').style.display = v <= 4 ? 'block' : 'none';
  document.getElementById('btnAvaliar').disabled = false;
};

async function verificarAvaliacaoHoje() {
  const card = document.getElementById('avaliacaoCard');
  if (!card) return;
  // rota extra não tem avaliação por enquanto (poderia ter); manter para linha fixa
  try {
    const ref = doc(db, CLIENTE_ID, 'avaliacoes');
    const snap = await getDoc(ref);
    const lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const hoje = hojeLocal();
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    const jaAvaliou = lista.find(a => a.dia === hoje && soDigitos(a.telefone) === meuTel);
    if (jaAvaliou) {
      document.getElementById('avaliacaoForm').style.display = 'none';
      document.getElementById('avaliacaoFeita').style.display = 'block';
      document.getElementById('avaliacaoResumo').textContent = '★'.repeat(jaAvaliou.estrelas) + '☆'.repeat(5-jaAvaliou.estrelas);
    } else {
      document.getElementById('avaliacaoForm').style.display = 'block';
      document.getElementById('avaliacaoFeita').style.display = 'none';
    }
  } catch(e) { console.warn('avaliacao check:', e); }
}

window.enviarAvaliacao = async function() {
  if (!avEstrelas) { alert('Toque nas estrelas para avaliar.'); return; }
  const just = document.getElementById('avJustificativa').value.trim();
  if (avEstrelas <= 4 && !just) { alert('Para 4 estrelas ou menos, conte o que podemos melhorar.'); return; }
  try {
    const ref = doc(db, CLIENTE_ID, 'avaliacoes');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const hoje = hojeLocal();
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    // 1 por dia: remove se já existir (substitui)
    lista = lista.filter(a => !(a.dia === hoje && soDigitos(a.telefone) === meuTel));
    lista.push({
      id: 'AV-' + Date.now().toString(36),
      dia: hoje,
      nome: PASSAGEIRO.nome, telefone: PASSAGEIRO.telefone,
      linha: PASSAGEIRO.linha, turno: PASSAGEIRO.turno,
      chave: CHAVE,
      estrelas: avEstrelas,
      justificativa: just,
      em: new Date().toISOString()
    });
    if (lista.length > 2000) lista = lista.slice(-2000);
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
    document.getElementById('avaliacaoForm').style.display = 'none';
    document.getElementById('avaliacaoFeita').style.display = 'block';
    document.getElementById('avaliacaoResumo').textContent = '★'.repeat(avEstrelas) + '☆'.repeat(5-avEstrelas);
  } catch(e) { alert('Erro ao enviar avaliação. Tente de novo.'); }
};

// ---- HORÁRIO RECALCULADO DO DIA ----
let unsubHorario = null;function escutarHorarioDia() {
  const ref = doc(db, CLIENTE_ID, 'horarios_do_dia');
  unsubHorario = onSnapshot(ref, (snap) => {
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const rodada = rodadaAtual();
    const meu = all.find(x => x.chave === CHAVE && x.rodada === rodada);
    const card = document.getElementById('horarioDiaCard');
    if (meu) {
      const minhaParada = (meu.paradas||[]).find(p => soDigitos(p.telefone) === soDigitos(PASSAGEIRO.telefone));
      if (minhaParada) {
        card.style.display = 'block';
        const mudou = PASSAGEIRO.horario && PASSAGEIRO.horario !== minhaParada.horarioNovo;
        // Notifica só quando o horário ajustado for diferente do último já avisado
        if (mudou && _ultimoHorarioNotif !== minhaParada.horarioNovo) {
          if (_ultimoHorarioNotif !== null) {
            notificar({
              icone: '',
              titulo: 'Horário ajustado para hoje',
              texto: 'Seu embarque mudou de ' + PASSAGEIRO.horario + ' para ' + minhaParada.horarioNovo + '. Válido só hoje.',
              acao: () => irPara('inicio')
            });
          }
          _ultimoHorarioNotif = minhaParada.horarioNovo;
        }
        document.getElementById('horarioDiaConteudo').innerHTML =
          '<div style="font-size:13px;color:var(--muted);margin-bottom:6px">Horário ajustado para hoje:</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:12px">' +
          (mudou ? '<span style="font-size:18px;color:var(--muted);text-decoration:line-through">' + PASSAGEIRO.horario + '</span><span style="font-size:20px">→</span>' : '') +
          '<span style="font-size:32px;font-weight:800;font-family:Barlow;color:var(--accent)">' + minhaParada.horarioNovo + '</span></div>' +
          '<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:6px">Válido só para hoje. Amanhã volta ao horário normal.</div>';
      } else { card.style.display = 'none'; }
    } else {
      card.style.display = 'none';
    }
  }, (err) => console.warn('horario:', err));
}
function escutarFerias() {
  const ref = doc(db, CLIENTE_ID, 'ferias');
  unsubFerias = onSnapshot(ref, (snap) => {
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    const hoje = hojeLocal();
    MINHA_FERIAS = all.find(f => soDigitos(f.telefone) === meuTel && f.fim >= hoje) || null;
    renderFerias();
  }, (err) => console.warn('ferias:', err));
}

function renderFerias() {
  const ativa = document.getElementById('feriasAtiva');
  const form = document.getElementById('feriasForm');
  if (MINHA_FERIAS) {
    ativa.style.display = 'block';
    form.style.display = 'none';
    const ini = fmtData(MINHA_FERIAS.inicio);
    const fim = fmtData(MINHA_FERIAS.fim);
    const hoje = hojeLocal();
    const vigente = MINHA_FERIAS.inicio <= hoje && MINHA_FERIAS.fim >= hoje;
    document.getElementById('feriasLabel').textContent = (vigente ? 'De férias até ' + fim : 'Afastamento agendado: ' + ini + ' a ' + fim);
    ['btnVou','btnIda','btnVolta','btnNaoVou'].forEach(id => document.getElementById(id).style.opacity = vigente ? '0.4' : '1');
  } else {
    ativa.style.display = 'none';
    form.style.display = 'block';
    ['btnVou','btnIda','btnVolta','btnNaoVou'].forEach(id => document.getElementById(id).style.opacity = '1');
  }
}

window.salvarFerias = async function() {
  const inicio = document.getElementById('feriasInicio').value;
  const fim = document.getElementById('feriasFim').value;
  if (!inicio || !fim) { alert('Informe as duas datas.'); return; }
  if (fim < inicio) { alert('A data de retorno deve ser depois do início.'); return; }
  try {
    const ref = doc(db, CLIENTE_ID, 'ferias');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    const hoje = hojeLocal();
    lista = lista.filter(f => f.fim >= hoje);
    lista = lista.filter(f => soDigitos(f.telefone) !== meuTel);
    lista.push({ telefone: PASSAGEIRO.telefone, nome: PASSAGEIRO.nome, chave: CHAVE, inicio, fim, registradoEm: new Date().toISOString() });
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
  } catch(e) { alert('Erro ao registrar: ' + e.message); }
};

window.cancelarFerias = async function() {
  if (!confirm('Cancelar seu período de férias/afastamento?')) return;
  try {
    const ref = doc(db, CLIENTE_ID, 'ferias');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    lista = lista.filter(f => soDigitos(f.telefone) !== meuTel);
    await setDoc(ref, { lista, updatedAt: new Date().toISOString() });
  } catch(e) { alert('Erro ao cancelar: ' + e.message); }
};

function fmtData(d) {
  if (!d) return '';
  const [y,m,dd] = d.split('-');
  return dd + '/' + m + '/' + y.slice(2);
}

function escutarPresencas() {
  const ref = doc(db, CLIENTE_ID, 'presencas');
  unsubPres = onSnapshot(ref, (snap) => {
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const rodada = rodadaAtual();
    const minhasLinha = all.filter(p => p.chave === CHAVE && p.rodada === rodada);
    renderPresencas(minhasLinha);
    const eu = minhasLinha.find(p => soDigitos(p.telefone) === soDigitos(PASSAGEIRO.telefone));
    if (eu) {
      const sent = eu.sentido || (eu.vai ? 'ambos' : 'nao');
      presencaHoje = sent;
      document.getElementById('btnVou').classList.toggle('on', sent === 'ambos');
      document.getElementById('btnIda').classList.toggle('on', sent === 'ida');
      document.getElementById('btnVolta').classList.toggle('on', sent === 'volta');
      document.getElementById('btnNaoVou').classList.toggle('on', sent === 'nao');
      const horaEu = eu.em ? new Date(eu.em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '';
      const lbl = { ambos:'Você confirmou ida e volta', ida:'Você confirmou só ida', volta:'Você confirmou só volta', nao:'Você avisou que não vai' };
      document.getElementById('presencaMsg').textContent = (lbl[sent] || '') + (horaEu ? ' às ' + horaEu : '') + '.';
    }
  }, (err) => console.warn('presencas:', err));
}

window.marcarPresenca = async function(sentido) {
  // sentido: 'ambos' | 'ida' | 'volta' | 'nao'
  presencaHoje = sentido;
  const vai = sentido !== 'nao';
  document.getElementById('btnVou').classList.toggle('on', sentido === 'ambos');
  document.getElementById('btnIda').classList.toggle('on', sentido === 'ida');
  document.getElementById('btnVolta').classList.toggle('on', sentido === 'volta');
  document.getElementById('btnNaoVou').classList.toggle('on', sentido === 'nao');
  try {
    const ref = doc(db, CLIENTE_ID, 'presencas');
    const snap = await getDoc(ref);
    let lista = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const rodada = rodadaAtual();
    const agoraISO = new Date().toISOString();
    lista = lista.filter(p => !p.rodada || p.rodada >= rodada);
    const meuTel = soDigitos(PASSAGEIRO.telefone);
    const existente = lista.find(p => p.chave === CHAVE && p.rodada === rodada && soDigitos(p.telefone) === meuTel);
    const historico = (existente && existente.historico) ? existente.historico.slice() : [];
    historico.push({ vai, sentido, em: agoraISO });
    lista = lista.filter(p => !(p.chave === CHAVE && p.rodada === rodada && soDigitos(p.telefone) === meuTel));
    lista.push({
      chave: CHAVE, rodada, nome: PASSAGEIRO.nome, telefone: PASSAGEIRO.telefone,
      vai, sentido, em: agoraISO,
      primeiraEm: existente && existente.primeiraEm ? existente.primeiraEm : agoraISO,
      historico
    });
    await setDoc(ref, { lista, updatedAt: agoraISO });
    const hora = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const msgs = {
      ambos: 'Confirmado (ida e volta) às ',
      ida: 'Só ida confirmado às ',
      volta: 'Só volta confirmado às ',
      nao: 'Avisado que não vai às '
    };
    document.getElementById('presencaMsg').textContent = (msgs[sentido] || '') + hora + '. O motorista foi notificado.';
  } catch(e) {
    document.getElementById('presencaMsg').textContent = 'Erro ao salvar. Tente de novo.';
  }
};

function renderPresencas(lista) {
  const vao = lista.filter(p => p.vai);
  const naoVao = lista.filter(p => !p.vai);
  document.getElementById('quemVaiResumo').innerHTML =
    '<div style="flex:1;text-align:center;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:10px"><div style="font-size:22px;font-weight:800;font-family:Barlow;color:var(--green)">' + vao.length + '</div><div style="font-size:11px;color:var(--muted)">confirmaram</div></div>' +
    '<div style="flex:1;text-align:center;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px"><div style="font-size:22px;font-weight:800;font-family:Barlow;color:var(--red)">' + naoVao.length + '</div><div style="font-size:11px;color:var(--muted)">não vão</div></div>';
  let html = '';
  if (vao.length) {
    html += '<div style="font-size:12px;color:var(--green);font-weight:700;margin-bottom:6px">Vão</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">' +
      vao.map(p => { const s = senLabel(p.sentido); return '<span style="background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:4px 10px;font-size:12px">' + esc(nome2(p.nome)) + s + '</span>'; }).join('') + '</div>';
  }
  if (naoVao.length) {
    html += '<div style="font-size:12px;color:var(--red);font-weight:700;margin-bottom:6px">Não vão</div><div style="display:flex;flex-wrap:wrap;gap:6px">' +
      naoVao.map(p => '<span style="background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:4px 10px;font-size:12px;color:var(--muted);text-decoration:line-through">' + esc(nome2(p.nome)) + '</span>').join('') + '</div>';
  }
  if (!lista.length) html = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:6px">Ninguém respondeu ainda.</div>';
  document.getElementById('quemVaiListas').innerHTML = html;
}
function nome2(n){ return (n||'').split(' ').slice(0,2).join(' '); }
function senLabel(s){
  if (s === 'ida') return ' <b style="color:var(--accent2)">→</b>';
  if (s === 'volta') return ' <b style="color:var(--accent)">←</b>';
  return '';
}

function chaveDoc() { return 'chat_' + CHAVE.replace('°','').replace(/[^a-zA-Z0-9_]/g,''); }

function escutarChat() {
  const ref = doc(db, CLIENTE_ID, chaveDoc());
  unsubChat = onSnapshot(ref, (snap) => {
    const msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
    renderChat(msgs);
    if (viewAtual !== 'chat' && msgs.length > chatVisto && chatVisto > 0) {
      temMsgNova = true;
      const ultima = msgs[msgs.length - 1] || {};
      notificar({
        icone: '',
        titulo: 'Nova mensagem na linha',
        texto: (ultima.autor ? ultima.autor + ': ' : '') + (ultima.txt || '').slice(0, 60),
        acao: () => irPara('chat')
      });
    }
    chatVisto = msgs.length;
    atualizarBadges();
  }, (err) => console.warn('chat:', err));
}

function renderChat(msgs) {
  const box = document.getElementById('chatMsgs');
  const cab = '<div class="msg sistema">— Grupo da Linha ' + PASSAGEIRO.linha + ' · ' + PASSAGEIRO.turno + ' Turno —</div>';
  box.innerHTML = cab + msgs.map((m, _i, _arr) => {
    const ehEu = m.tel && soDigitos(m.tel) === soDigitos(PASSAGEIRO.telefone);
    const tipo = ehEu ? 'eu' : m.tipo;
    let inner = '';
    if (m.autor && !ehEu) inner += '<div class="meta">' + esc(m.autor) + '</div>';
    if (m.tipo === 'loc') {
      inner += '<div><span class="live-dot"></span> ' + esc(m.txt) + '</div>';
      if (m.link) inner += '<a href="' + esc(m.link) + '" target="_blank" style="display:inline-block;margin-top:6px;color:var(--green);font-weight:700;font-size:13px">Abrir no mapa →</a>';
    } else {
      inner += '<div>' + esc(m.txt) + '</div>';
    }
    if (m.hora) inner += '<div class="time">' + m.hora + '</div>';
    var _sep = _sepDataChat(m, _i > 0 ? _arr[_i-1] : null);
    return _sep + '<div class="msg ' + tipo + '">' + inner + '</div>';
  }).join('');
  box.scrollTop = box.scrollHeight;
}

window.enviarMsg = async function() {
  const inp = document.getElementById('chatInput');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  try {
    const ref = doc(db, CLIENTE_ID, chaveDoc());
    const snap = await getDoc(ref);
    let msgs = (snap.exists() && snap.data().msgs) ? snap.data().msgs : [];
    msgs.push({ tipo:'passageiro', autor: PASSAGEIRO.nome, tel: PASSAGEIRO.telefone, txt, hora: agora(), em: new Date().toISOString() });
    if (msgs.length > 200) msgs = msgs.slice(-200);
    await setDoc(ref, { msgs, updatedAt: new Date().toISOString() });
  } catch(e) {
    inp.value = txt;
    alert('Erro ao enviar. Tente de novo.');
  }
};

function escutarAvisos() {
  const ref = doc(db, CLIENTE_ID, 'avisos');
  unsubAvisos = onSnapshot(ref, (snap) => {
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const meus = all.filter(a => !a.chave || a.chave === CHAVE).sort((x,y)=>(y.em||'').localeCompare(x.em||''));
    renderAvisos(meus);
    if (viewAtual !== 'avisos' && meus.length > avisosVisto && avisosVisto > 0) {
      temAvisoNovo = true;
      const novo = meus[0] || {};
      notificar({
        icone: '',
        titulo: 'Novo aviso',
        texto: (novo.txt || '').slice(0, 70),
        acao: () => irPara('avisos')
      });
    }
    avisosVisto = meus.length;
    atualizarBadges();
  }, (err) => console.warn('avisos:', err));
}

function renderAvisos(lista) {
  if (!lista.length) {
    document.getElementById('avisosList').innerHTML = '<div style="color:var(--muted);text-align:center;padding:40px 16px"><div style="width:34px;height:34px;margin:0 auto 8px;color:var(--muted)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h4l1.5 3h5L16 13h4"/><path d="M4 13 6.5 6h11L20 13v5H4v-5Z"/></svg></div>Nenhum aviso no momento.</div>';
    return;
  }
  document.getElementById('avisosList').innerHTML = lista.map(a => {
    const data = a.em ? new Date(a.em).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
    return '<div class="aviso ' + (a.tipo==='pdf'?'pdf':'') + '">' +
      '<div class="top"><span>' + esc(a.autor||'Gestor') + '</span><span>' + data + '</span></div>' +
      (a.link ? '<a href="' + esc(a.link) + '" target="_blank" style="color:var(--accent2);text-decoration:none"><div class="txt">' + esc(a.txt) + '</div></a>' : '<div class="txt">' + esc(a.txt) + '</div>') +
    '</div>';
  }).join('');
}

function _trkDist(aLat,aLng,bLat,bLng){ const R=6371000,t=Math.PI/180; const dLat=(bLat-aLat)*t, dLng=(bLng-aLng)*t; const x=Math.sin(dLat/2)**2+Math.cos(aLat*t)*Math.cos(bLat*t)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(x)); }
function escutarRastreador() {
  const ref = doc(db, CLIENTE_ID, 'rastreador');
  unsubTrack = onSnapshot(ref, (snap) => {
    const all = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
    const rodada = rodadaAtual();
    const meu = all.find(t => t.chave === CHAVE && t.rodada === rodada);
    const area = document.getElementById('trackArea');
    if (!area) return;
    // 1) GPS ao vivo (lat/lng do celular do motorista) - prioritario
    if (meu && meu.gpsAtivo && meu.lat!=null && meu.lng!=null) {
      let info = '';
      if (PASSAGEIRO.lat!=null && PASSAGEIRO.lng!=null) {
        // ===== AJUSTES DA ESTIMATIVA (pode regular estes 2 numeros) =====
        const FATOR_RUA = 1.0;    // 1.0 = distancia em linha reta pura (calibrado p/ Sorocaba)
        const VEL_KMH = 25;       // velocidade media da van no transito urbano
        const metrosReta = _trkDist(meu.lat, meu.lng, PASSAGEIRO.lat, PASSAGEIRO.lng);
        const km = (metrosReta/1000) * FATOR_RUA;   // distancia estimada pela rua
        const minutos = Math.max(1, Math.round((km/VEL_KMH)*60));
        const distTxt = km < 1 ? Math.round(km*1000)+' m' : km.toFixed(1).replace('.',',')+' km';
        info = '<div style=\"background:var(--surface2);border-radius:12px;padding:12px;margin-bottom:10px\">' +
          '<div style=\"display:flex;justify-content:space-between;align-items:center\">' +
          '<div><div style=\"font-size:11px;color:var(--muted)\">Dist\u00e2ncia at\u00e9 voc\u00ea</div>' +
          '<div style=\"font-size:22px;font-weight:800;font-family:Barlow;color:var(--accent)\">'+distTxt+'</div></div>' +
          '<div style=\"text-align:right\"><div style=\"font-size:11px;color:var(--muted)\">Chega em ~</div>' +
          '<div style=\"font-size:22px;font-weight:800;font-family:Barlow;color:var(--green)\">'+minutos+' min</div></div></div>' +
          '<div style=\"font-size:10px;color:var(--muted);margin-top:6px\">Estimativa aproximada (linha reta). O tempo real depende do tr\u00e2nsito.</div>' +
          '</div>';
      }
      const mapsUrl = 'https://www.google.com/maps?q=' + meu.lat + ',' + meu.lng;
      area.innerHTML = '<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\"><span class=\"live-dot\"></span><span style=\"font-size:13px;color:var(--green);font-weight:600\">Van ao vivo \u00b7 GPS do motorista</span></div>' + info +
        '<a href=\"' + mapsUrl + '\" target=\"_blank\" class=\"track-btn\">\uD83D\uDDFA\uFE0F Ver van no mapa</a>';
      return;
    }
    // 2) Link colado manual (modo antigo) - mantido
    if (meu && meu.link) {
      area.innerHTML = '<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\"><span class=\"live-dot\"></span><span style=\"font-size:13px;color:var(--green);font-weight:600\">Van compartilhando localiza\u00e7\u00e3o</span></div>' +
        '<a href=\"' + esc(meu.link) + '\" target=\"_blank\" class=\"track-btn\">\uD83D\uDDFA\uFE0F Acompanhar van ao vivo</a>';
      return;
    }
    // 3) Nada compartilhado
    area.innerHTML = '<div class=\"track-off\">O motorista ainda n\u00e3o compartilhou a localiza\u00e7\u00e3o para esta viagem.</div>';
  }, (err) => console.warn('rastreador:', err));
}

function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ===== DATA LOCAL (fuso Brasilia UTC-3) =====
// Corrige o bug de toISOString() devolver UTC (que vira o dia seguinte apos 21h).
function hojeLocal(baseDate, offsetDias){
  var d = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date();
  if (offsetDias) d.setTime(d.getTime() + offsetDias*86400000);
  // desloca para -03:00 e formata em UTC para extrair a data local de Brasilia
  var br = new Date(d.getTime() - 3*3600000);
  return br.toISOString().slice(0,10);
}
function mesLocal(baseDate){
  var d = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date();
  var br = new Date(d.getTime() - 3*3600000);
  return br.toISOString().slice(0,7);
}

function _diaChat(m){ try{ var d = m && m.em ? new Date(m.em) : null; if(!d || isNaN(d)) return ''; return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }catch(e){ return ''; } }
function _fmtDiaChat(m){ try{ var d = new Date(m.em); var hoje=new Date(); var ymd=function(x){return x.getFullYear()+'-'+x.getMonth()+'-'+x.getDate();}; var ont=new Date(hoje); ont.setDate(hoje.getDate()-1); if(ymd(d)===ymd(hoje)) return 'Hoje'; if(ymd(d)===ymd(ont)) return 'Ontem'; return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(); }catch(e){ return ''; } }
function _sepDataChat(m, anterior){ var dAtual=_diaChat(m); if(!dAtual) return ''; var dAnt = anterior ? _diaChat(anterior) : ''; if(dAtual===dAnt) return ''; var lbl=_fmtDiaChat(m); if(!lbl) return ''; return '<div style="align-self:center;margin:8px auto;padding:3px 12px;background:rgba(128,128,128,0.18);border-radius:12px;font-size:11px;font-weight:600;color:var(--muted);text-align:center">'+lbl+'</div>'; }
function agora(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }

document.getElementById('loginTel').addEventListener('input', function(e){
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 7) e.target.value = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
  else if (v.length > 2) e.target.value = '(' + v.slice(0,2) + ') ' + v.slice(2);
  else e.target.value = v;
});
