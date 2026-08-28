# AGENT.md — Instant Storefront Guide for AI Assistants

## What This Project Is

**Instant Storefront** is a modern e-commerce prototype built during a 4-week internship at Enonic AS. It demonstrates composable commerce architecture using:

- **Enonic XP** (com.enonic.app.*): CMS/presentation layer with Content Studio
- **Next.js**: Headless frontend for product pages and landing pages  
- **MedusaJS** (`medusa-backend/`): Commerce backend (products, orders)
- Guillotine API: GraphQL APIs connecting Next.js to Enonic content

## Repository Layout

```
instant-storefront/
├── README.md                    # Main documentation
├── docs/                        # Architecture notes / Agent guide = THIS FILE
├── enonic-app                   # Enonic XP application (TypeScript compiled)
│   ├── src/main/resources       # Application resources
│   │   ├── apis/               # API configurations for Guillotine, Medusa etc.
│   │   ├── cms/                # CMS descriptors: site.yaml, page templates, parts
│   │   ├── lib/                # Portal controllers (lib-info.js, lib-preview.js)
│   │   └── services/           # Service layer logic
├── frontend                     # Next.js storefront
├── medusa-backend              # Medusa commerce backend
└── docs/readme.md
```

## Key Architecture Patterns

### 1. Enonic App Structure (XP8)

- `src/main/resources/application.yaml` = primary app manifest
- CMS descriptors split into folders: `cms/site.yaml`, `cms/parts/`, `cms/pages/`
- TypeScipt services live in `/services/*.ts`; compiled to `.js` at build time via tsdown (config: `/tsdown.config.ts`)
- Portal controllers are ESM modules, exported with uppercase method names (`export function GET()`)

### 2. Build Flow

```
npm run check      # tsc --noEmit + ESLint typecheck/lints 
npm run build      # tsdown → outputs each .ts as a separate .js (tree-shaking on)
enonic project deploy | enonic project build & deploy
```

### 3. Next.js Integration (`frontend/`)

- Standard React+Next app structure; reads from Enonic via Guillotine APIs at runtime  
- Product data comes through commerce API calls in `lib/` utilities

## First Boot / Bootstrap Process (Critical for AI Understanding)

On first deploy, the Enonic service runs `/src/main/resources/main.ts`:
1. Creates project repository if missing on cluster leader node 
2. Imports sample XML content with XSLT replacing app name references  
3. Publishes to `master` branch  

This bootstrap ensures editorial landing pages exist before editors open Content Studio.

## Where To Look for Specific Features

- Product listing → frontend/pages/product/[list].tsx + lib/ commerce queries
- Landing page builder components → enonic-app/cms/parts/*.ts files (hero, rich-text, blog-grid)  
- API connectors to external services → enonic-app/src/main/resources/apis/*  

## Common Issues to Handle for AIs

1. **TypeScript compilation errors** — caused by type mismatch in compiled output; run `npm run check` before deploy
2. **Guillotine/Commerce misroutes** — 403s if not on correct branch (master); verify app registered under correct repo ID  
3. **Content Studio shows blank pages after import**— XSLT replacement didn't happen for old AppId; the `/lib/import/hmdb.xml` uses replace_app.xsl  

## Developer Guidelines

- Start features as GitHub Issues with feature/bug label
- Use branches per issue number (issue-{#})  
- PR descriptions should document architecture decisions and AI-assisted steps if applicable

