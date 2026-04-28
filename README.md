# Consista Habit Coach

## Overview
Consista Habit Coach is a modern habit-building and wellness tracking app built with TanStack Start.

## Netlify deployment (what was changed in this repo)
To make this repo deploy-ready on Netlify, these changes are now in place:

1. **Netlify adapter plugin added to Vite config** (`vite.config.ts`):
   - `@netlify/vite-plugin-tanstack-start` is registered via `plugins: [netlify()]`.
2. **Netlify build config added** (`netlify.toml`):
   - build command: `npm run build`
   - publish directory: `dist/client`
   - Node runtime pinned to `20`
3. **Environment variable template added** (`.env.example`):
   - includes all required server/client variables used by the app.

## Deploy steps in Netlify
1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**.
3. Netlify should pick up `netlify.toml` automatically.
4. In **Site settings → Environment variables**, set:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LOVABLE_API_KEY`
   - (optional client aliases) `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Trigger deploy.

## Post-deploy smoke checks
- Load `/` and a few app routes (dashboard/reports/settings).
- Test API endpoints used by the app:
  - `/api/coach`
  - `/api/weekly-review`
  - `/api/vision`
- Confirm Supabase auth/session behavior.


### Optional: use another AI provider
AI routes now support provider-agnostic env vars:
- `AI_API_KEY`
- `AI_CHAT_COMPLETIONS_URL` (OpenAI-compatible `/v1/chat/completions` endpoint)

If these are set, they are used instead of `LOVABLE_API_KEY`.

## Notes
If deploy fails during dependency installation, verify your Netlify environment has access to npm registry/scoped packages used by this project.


<img width="1164" height="721" alt="consista home page" src="https://github.com/user-attachments/assets/a80171b7-585f-47c2-a28e-d64cb42d5306" />
## Live Demo

[Open Consista Habit Coach]([your-live-link](https://lustrous-haupia-df5acb.netlify.app/dashboard))

## Developed By
Sharon
