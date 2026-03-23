// server/logger.js — Fonctions de log centralisées
import { supabase } from './db.js';

/**
 * Log une tentative de connexion (succès ou échec)
 */
export async function logLogin({ adminId = null, usernameTry, success, ip, userAgent, failureReason = null }) {
  const { error } = await supabase.from('login_logs').insert({
    admin_id:       adminId,
    username_try:   usernameTry,
    success,
    ip_address:     ip   || null,
    user_agent:     userAgent || null,
    failure_reason: failureReason,
  });
  if (error) console.error('[logger] login_log error:', error.message);
}

/**
 * Log une action admin (sauvegarde, ajout, suppression, etc.)
 */
export async function logAction({ adminId, username, action, target = null, details = null, ip }) {
  const { error } = await supabase.from('action_logs').insert({
    admin_id:   adminId,
    username,
    action,
    target:     target  || null,
    details:    details || null,
    ip_address: ip      || null,
  });
  if (error) console.error('[logger] action_log error:', error.message);
}

/**
 * Récupère l'IP réelle (derrière proxy/Nginx)
 */
export function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
}
