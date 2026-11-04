# dsh-superagent-guide

Infografía **"DeepSeek Super-Agent · Guía 2026"** — visualización independiente del contenido de
[IA University](https://ia.university/ia-news/deepseek-super-agent-guia-2026/) y del repositorio
oficial [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) (MIT).

Incluye dos artefactos:

1. **App** — `guide.html`, un HTML autocontenido (CSS + SVG inline, sin dependencias ni build).
   Ábrelo directo en el navegador o sírvelo con el plugin. Incluye:
   - Tarjetas de datos clave (MIT, 11k★, fechas…)
   - Diagrama de flujo SVG (GitHub → mención → policy → ticket → sesión → PR → revisión)
   - Comparativa agente tradicional vs. Super-Agent
   - Línea de tiempo de instalación en 8 pasos
   - Cuidados y FAQ

2. **Plugin de DeepSeek Harness** — `index.js`, un bundle que:
   - Sirve la infografía en `/superagent-guide` (ruta sobre `ctx.webServer`).
   - Registra las herramientas `superagent_guide` (resumen en Markdown) y
     `superagent_guide_url` (URL de la infografía).

## Uso de la app

```bash
# abrir directo
start guide.html
```

## Instalación del plugin

```bash
dsh plugin --profile <perfil> add ./dsh-superagent-guide
```

O manualmente: copiar la carpeta a `$DSH_HOME/profiles/node_modules/dsh-superagent-guide/`
y añadir en `$DSH_HOME/profiles/<perfil>/cordis.patch.yml`:

```yaml
- insert:
    - id: superagent-guide
      name: dsh-superagent-guide
```

Luego abre `http://127.0.0.1:<puerto>/superagent-guide`.

## Publicar en GitHub

```bash
cd dsh-superagent-guide
git init && git add -A && git commit -m "dsh-superagent-guide: app + plugin"
git remote add origin https://github.com/carlosvalderramah-ai/DEEPSEEK.git
git branch -M main
git push -u origin main
```

## Estado

En funcionamiento
