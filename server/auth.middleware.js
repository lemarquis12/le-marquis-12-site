// server/auth.middleware.js
import jwt        from 'jsonwebtoken';
import crypto     from 'crypto';
import { supabase } from './db.js';

/**
 * Middleware d'authentification :
 * 1. Extrait le JWT du header Authorization
 * 2. Vérifie sa signature
 * 3. Vérifie que la session existe en BDD et n'est pas révoquée/expirée
 * 4. Attache req.admin pour les routes suivantes
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.slice(7);

  // 1. Vérifier la signature JWT
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  // 2. Vérifier la session en BDD (protection contre les tokens révoqués)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, admin_id, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !session) {
    return res.status(401).json({ error: 'Session introuvable' });
  }
  if (session.revoked_at) {
    return res.status(401).json({ error: 'Session révoquée' });
  }
  if (new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Session expirée' });
  }

  // 3. Charger l'admin
  const { data: admin } = await supabase
    .from('admins')
    .select('id, username, role, is_active')
    .eq('id', session.admin_id)
    .single();

  if (!admin || !admin.is_active) {
    return res.status(401).json({ error: 'Compte désactivé' });
  }

  req.admin      = admin;
  req.sessionId  = session.id;
  req.tokenHash  = tokenHash;
  next();
}

/**
 * Middleware superadmin uniquement
 */
export function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès réservé au superadmin' });
  }
  next();
}
