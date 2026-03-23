// server/routes/logs.routes.js
import { Router }      from 'express';
import { supabase }    from '../db.js';
import { requireAuth, requireSuperAdmin } from '../auth.middleware.js';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

/* ════════════════════════════════════════
   GET /api/logs/logins?limit=50&offset=0&success=true
   Historique des connexions
════════════════════════════════════════ */
router.get('/logins', async (req, res) => {
  const limit   = Math.min(parseInt(req.query.limit)  || 50, 200);
  const offset  = parseInt(req.query.offset) || 0;
  const success = req.query.success;

  let query = supabase
    .from('login_logs')
    .select('id, username_try, success, ip_address, user_agent, failure_reason, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (success !== undefined) query = query.eq('success', success === 'true');

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  res.json({ data, total: count, limit, offset });
});

/* ════════════════════════════════════════
   GET /api/logs/actions?limit=50&offset=0&action=save_news
   Historique des actions admin
════════════════════════════════════════ */
router.get('/actions', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const action = req.query.action;

  let query = supabase
    .from('action_logs')
    .select('id, username, action, target, details, ip_address, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action) query = query.eq('action', action);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  res.json({ data, total: count, limit, offset });
});

/* ════════════════════════════════════════
   GET /api/logs/sessions
   Sessions actives
════════════════════════════════════════ */
router.get('/sessions', async (req, res) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, admin_id, ip_address, user_agent, expires_at, created_at, admins(username)')
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Erreur BDD' });
  res.json(data || []);
});

/* ════════════════════════════════════════
   DELETE /api/logs/sessions/:id
   Révoquer une session spécifique
════════════════════════════════════════ */
router.delete('/sessions/:id', async (req, res) => {
  await supabase
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', req.params.id);

  res.json({ message: 'Session révoquée' });
});

/* ════════════════════════════════════════
   GET /api/logs/dashboard
   Stats rapides
════════════════════════════════════════ */
router.get('/dashboard', async (req, res) => {
  const { data, error } = await supabase
    .from('admin_dashboard')
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: 'Erreur BDD' });
  res.json(data);
});

export default router;
