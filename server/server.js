// server/server.js — Point d'entrée principal
import 'dotenv/config';
import express       from 'express';
import helmet        from 'helmet';
import cors          from 'cors';
import morgan        from 'morgan';
import rateLimit     from 'express-rate-limit';

import authRoutes    from './routes/auth.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import logsRoutes    from './routes/logs.routes.js';
import adminsRoutes  from './routes/admins.routes.js';

const app  = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

/* ══════════════════════════════════════════
   SÉCURITÉ — Headers HTTP
══════════════════════════════════════════ */
app.use(helmet({
  contentSecurityPolicy: false, // géré par le frontend
}));

/* ══════════════════════════════════════════
   CORS — Origines autorisées
══════════════════════════════════════════ */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5500',   // Live Server VSCode
  'http://127.0.0.1:5500',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Autorise les requêtes sans origin (ex: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqué pour l'origine : ${origin}`));
  },
  credentials: true,
}));

/* ══════════════════════════════════════════
   BODY PARSER
══════════════════════════════════════════ */
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

/* ══════════════════════════════════════════
   LOGS HTTP
══════════════════════════════════════════ */
app.use(morgan(isProd ? 'combined' : 'dev'));

/* ══════════════════════════════════════════
   RATE LIMITING
══════════════════════════════════════════ */
// Général : 100 req / 15 min par IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Trop de requêtes, réessaie dans 15 minutes.' },
}));

// Login : 10 tentatives / 15 min (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: false,
  message: { error: 'Trop de tentatives de connexion. Réessaie dans 15 minutes.' },
});

/* ══════════════════════════════════════════
   ROUTES
══════════════════════════════════════════ */
app.use('/api/auth',    loginLimiter, authRoutes);
app.use('/api/content', adminRoutes);
app.use('/api/logs',    logsRoutes);
app.use('/api/admins',  adminsRoutes);

/* ── Sanity check ── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

/* ══════════════════════════════════════════
   404 + GESTION D'ERREURS
══════════════════════════════════════════ */
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: isProd ? 'Erreur serveur' : err.message });
});

/* ══════════════════════════════════════════
   DÉMARRAGE
══════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL?.slice(0, 40)}...`);
});

export default app;
