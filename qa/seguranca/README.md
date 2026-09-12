# Bancada de segurança — Firestore Rules

Esta suíte **ataca** as Rules num Emulator local e mede o veredito. Ela não lê
regra: executa. Nunca aponta para produção, e os dados são fictícios.

```
npm run qa:seguranca
```

---

## Pré-requisito: Java 21+

O Emulator do Firestore é um JAR, e o `firebase-tools` 15 recusa versões
anteriores:

```
Error: firebase-tools no longer supports Java version before 21.
```

Se `java -version` não responder, ou responder algo abaixo de 21, há duas
saídas.

### Instalar no sistema

```
winget install Microsoft.OpenJDK.21
```

### JRE portátil, sem instalar nada

Não mexe no sistema, não pede elevação, e some quando você apagar a pasta:

```powershell
# baixar e extrair
Invoke-WebRequest -Uri "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jre/hotspot/normal/eclipse" -OutFile "$env:TEMP\jre21.zip"
Expand-Archive "$env:TEMP\jre21.zip" -DestinationPath "$env:TEMP\jre21" -Force

# usar só nesta sessão
$env:JAVA_HOME = (Get-ChildItem "$env:TEMP\jre21" -Recurse -Filter java.exe |
                  Select-Object -First 1).Directory.Parent.FullName
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

npm run qa:seguranca
```

> No Git Bash, `export PATH="C:/...:$PATH"` **não funciona**: o `C:` é lido como
> separador de caminho e a entrada se perde. Use PowerShell, ou a forma
> `/c/Users/...`.

---

## O que a saída significa

Cada verificação declara o esperado **por conjunto de regras**:

| Esperado | Leitura |
|---|---|
| `ATUAL: ALLOW` · `CANDIDATA: DENY` | buraco que a candidata fecha |
| `ATUAL: ALLOW` · `CANDIDATA: ALLOW` | acesso legítimo — não pode sumir |
| `ATUAL: DENY` · `CANDIDATA: DENY` | já estava fechado; é guarda de regressão |

E os vereditos:

- **`ok`** — medido igual ao previsto.
- **`*** NÃO FECHOU`** — a candidata deixou passar um ataque.
- **`*** REGRESSÃO`** — a candidata quebrou acesso legítimo. **Impeditivo.**
- **`*** diverge do lido`** — a auditoria por leitura errou. O Emulator manda.

### O ruído de `PERMISSION_DENIED` no log é esperado

Cada ataque negado produz um erro gRPC do SDK antes de a suíte registrar
`DENY`. Log cheio de `PERMISSION_DENIED` é sinal de que as regras estão
**funcionando**, não de que a bancada quebrou. O que vale é a tabela do fim.

---

## Arquivos

| Arquivo | O que é |
|---|---|
| `regras_test.js` | a suíte |
| `firebase.json` | configuração **só de emulador** — não é alvo de deploy |
| `firestore_*.rules` | cópia fiel do que está **publicado**, para baseline e rollback |
| `firestore_*.CANDIDATE.rules` | as propostas. **Nunca publicadas daqui.** |

As Rules moram nesta pasta, e não na raiz, de propósito: a raiz é servida pelo
GitHub Pages, e não há razão para entregar o mapa das regras em
`app.temvia.com.br`.

---

## Legado congelado

`/evamo` e `/evamo_pins` estão **byte a byte iguais ao publicado** na candidata.
Decisão do Milton: não corrigir e não derrubar o legado até a migração para a
temvia.

Os testes de legado continuam aqui como **guarda**: eles fixam o comportamento
atual para que uma mudança na plataforma nova não o altere sem querer. Onde
medem permissão folgada, está anotado `[dívida aceita]` — é medição consciente,
não falha da suíte.

A invariável que não pode cair em hipótese nenhuma:

```
UNAUTH GET /evamo/dados → ALLOW
```
