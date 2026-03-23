// server/routes/auth.routes.js
import { Router }    from 'express';
import bcrypt        from 'bcrypt';
import jwt           from 'jsonwebtoken';
import crypto        from 'crypto';
import { z }         from 'zod';
import { supabase }  from '../db.js';
import { requireAuth } from '../auth.middleware.js';
import { logLogin, logAction, getIP } from '../logger.js';

const router = Router();

// ── Schéma de validation login ──
const LoginSchema = z.object({
  username: z.string().min(1).max(64).trim(),
  password: z.string().min(1).max(128),
});

/* ════════════════════════════════════════
   POST /api/auth/login
   Authentifie un admin et crée une session
════════════════════════════════════════ */
router.post('/login', async (req, res) => {
  const ip        = getIP(req);
  const userAgent = req.headers['user-agent'] || '';

  // Validation du body
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Données invalides' });
  }
  const { username, password } = parsed.data;

  // Chercher l'admin
  const { data: admin } = await supabase
    .from('admins')
    .select('id, username, password_hash, role, is_active')
    .eq('username', username)
    .single();

  // Compte inconnu — on simule un délai bcrypt pour éviter le timing attack
  if (!admin) {
    await bcrypt.compare(password, '$2b$12$invalidhashtopreventtimingattack00000000000000000000000');
    await logLogin({ usernameTry: username, success: false, ip, userAgent, failureReason: 'unknown_user' });
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  // Compte désactivé
  if (!admin.is_active) {
    await logLogin({ adminId: admin.id, usernameTry: username, success: false, ip, userAgent, failureReason: 'account_disabled' });
    return res.status(401).json({ error: 'Compte désactivé' });
  }

  // Vérification mot de passe
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    await logLogin({ adminId: admin.id, usernameTry: username, success: false, ip, userAgent, failureReason: 'wrong_password' });
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  // Générer le JWT
  const token = jwt.sign(
    { sub: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '4h' }
  );

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + parseExpiry(process.env.JWT_EXPIRES_IN || '4h'));

  // Enregistrer la session en BDD
  await supabase.from('sessions').insert({
    admin_id:   admin.id,
    token_hash: tokenHash,
    ip_address: ip,
    user_agent: userAgent,
    expires_at: expiresAt.toISOString(),
  });

  // Log succès
  await logLogin({ adminId: admin.id, usernameTry: username, success: true, ip, userAgent });

  res.json({
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role },
    expiresAt: expiresAt.toISOString(),
  });
});

/* ════════════════════════════════════════
   POST /api/auth/logout
   Révoque la session en cours
════════════════════════════════════════ */
router.post('/logout', requireAuth, async (req, res) => {
  await supabase
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', req.tokenHash);

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'logout',
    ip:       getIP(req),
  });

  res.json({ message: 'Déconnecté' });
});

/* ════════════════════════════════════════
   GET /api/auth/me
   Retourne le profil de l'admin connecté
════════════════════════════════════════ */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    id:       req.admin.id,
    username: req.admin.username,
    role:     req.admin.role,
  });
});

/* ════════════════════════════════════════
   POST /api/auth/logout-all
   Révoque TOUTES les sessions de l'admin
════════════════════════════════════════ */
router.post('/logout-all', requireAuth, async (req, res) => {
  await supabase
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('admin_id', req.admin.id)
    .is('revoked_at', null);

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'logout_all_sessions',
    ip:       getIP(req),
  });

  res.json({ message: 'Toutes les sessions révoquées' });
});

/* ── Helper : convertit "4h" / "1d" en ms ── */
function parseExpiry(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match  = str.match(/^(\d+)([smhd])$/);
  return match ? parseInt(match[1]) * (units[match[2]] || 3600000) : 14400000;
}

export default router;
