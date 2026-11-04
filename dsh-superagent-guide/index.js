/**
 * dsh-superagent-guide — DeepSeek Harness plugin.
 *
 * Sirve la infografía "DeepSeek Super-Agent · Guía 2026" dentro de la interfaz
 * web del harness (ruta `/superagent-guide`) y expone una herramienta para que
 * el asistente pueda responder con el resumen de la guía y su URL.
 *
 * @module dsh-superagent-guide
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'superagent-guide';
export const inject = ['webServer', 'tools'];

const GUIDE_HTML = join(dirname(fileURLToPath(import.meta.url)), 'guide.html');

const SUMMARY = `# DeepSeek Super-Agent — Guía 2026

Agente de programación **proactivo** y gratis (MIT) de DeepSeek, publicado el 31/10/2026 como prototipo en GitHub (\`deepseek-ai/dsh-superagent-prototype\`). Se conecta a **un** repositorio, escucha los pedidos en GitHub (y opcionalmente Feishu) y responde en la misma conversación, normalmente con un **pull request** listo para revisar.

## Datos clave
- Licencia MIT; solo pagas el modelo de IA que conectes a DeepSeek Harness.
- +11.000 estrellas en sus primeros dos días.
- De mención \`@agente\` a ticket: ~1 minuto.

## Flujo
1. GitHub (issue/PR/comentario) → mención \`@agente\`
2. Source escucha (poll ~1 min) → Policy verifica si quien pide está autorizado
3. Se abre un **Ticket** → el agente trabaja en su propia sesión y carpeta
4. Entrega (PR/respuesta) → una **persona** revisa y fusiona
- El trabajo proactivo arranca en modo **observe** (registra sin ejecutar).

## Instalación (resumen)
1. Node 22.19+, pnpm, git 2.32+, tmux, Python 3.8+, GitHub CLI 2.48+.
2. \`npm install -g @deepseek-ai/dsh@0.2.1-rc.3\` + proveedor de modelo.
3. Cuenta de GitHub dedicada para el agente (nunca la personal).
4. Clonar el repo y pedirle a un agente: «Lee SETUP.md y configura dsh-superagent conmigo».
5. Empezar seguro: solo tu usuario autorizado, modo observe, sin auto-merge.

## Cuidados
Es un prototipo; los trabajadores ejecutan comandos con permisos amplios (usar cuenta de sistema dedicada); empezar con un repo secundario y revisión humana.`;

function htmlBody() {
  return readFileSync(GUIDE_HTML, 'utf8');
}

export function apply(ctx) {
  const host = ctx.webServer.host === '0.0.0.0' ? '127.0.0.1' : ctx.webServer.host;
  const baseUrl = `http://${host}:${ctx.webServer.port}`;
  const guideUrl = `${baseUrl}/superagent-guide`;

  const disposeRoute = ctx.webServer.register({
    kind: 'prefix',
    path: '/superagent-guide',
    handler(req, res) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('method not allowed');
      }
      const body = Buffer.from(htmlBody(), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': body.length,
        'Cache-Control': 'no-store'
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    }
  });

  const textOutput = (renderText) => ({
    schema: { type: 'json' },
    render(_args, value) {
      return [{ type: 'text', text: renderText(value) }];
    }
  });

  const disposers = [
    ctx.tools.register(defineTool({
      name: 'superagent_guide',
      description: 'Devuelve el resumen de la guía de DeepSeek Super-Agent (dsh-superagent): qué es, cómo funciona, instalación y cuidados.',
      parameters: {},
      output: textOutput(() => SUMMARY),
      async execute() {
        return { summary: SUMMARY };
      }
    })),
    ctx.tools.register(defineTool({
      name: 'superagent_guide_url',
      description: 'Devuelve la URL de la infografía visual de DeepSeek Super-Agent servida por este plugin.',
      parameters: {},
      output: textOutput((value) => value.url),
      async execute() {
        return { url: guideUrl };
      }
    }))
  ];

  ctx.effect(() => {
    return () => {
      disposeRoute();
      for (const dispose of disposers) {
        try { dispose(); } catch { /* ignore */ }
      }
    };
  }, 'superagent-guide');

  ctx.logger?.info(`superagent-guide: infografía disponible en ${guideUrl}`);
}
