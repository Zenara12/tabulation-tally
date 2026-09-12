import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['nuxt-auth-utils'],

  // Cookie security:
  //   - Production (NODE_ENV=production): secure:true  — assumes HTTPS via reverse proxy / domain
  //   - Development / local network HTTP: secure:false — allows session cookies over plain HTTP
  // Override at runtime by setting NUXT_SESSION_COOKIE_SECURE=false in your .env if needed.
  runtimeConfig: {
    seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@tabulation.local',
    public: {
      seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@tabulation.local',
    },
    session: {
      cookie: {
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'Tabulation System',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
        },
      ],
    },
  },
})
