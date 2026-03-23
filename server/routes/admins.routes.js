// server/routes/admins.routes.js
import { Router }      from 'express';
import bcrypt          from 'bcrypt';
import { z }           from 'zod';
import { supabase }    from '../db.js';
import { requireAuth, requireSuperAdmin } from '../auth.middleware.js';
import { logAction, getIP } from '../logger.js';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

const BCRYPT_ROUNDS = 12;

const CreateAdminSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/, 'Caractères alphanumériques uniquement'),
  password: z.string().min(8).max(128),
  role:     z.enum(['admin','superadmin']).default('admin'),
});

const UpdateAdminSchema = z.object({
  password:  z.string().min(8).max(128).optional(),
  role:      z.enum(['admin','superadmin']).optional(),
  is_active: z.boolean().optional(),
});

/* ── Liste tous les admins ── */
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('admins')
    .select('id, username, role, is_active, created_at, updated_at')
    .order('created_at');
  if (error) return res.status(500).json({ error: 'Erreur BDD' });
  res.json(data);
});

/* ── Créer un admin ── */
router.post('/', async (req, res) => {
  const parsed = CreateAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });

  const { username, password, role } = parsed.data;
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { data, error } = await supabase
    .from('admins')
    .insert({ username, password_hash, role })
    .select('id, username, role, created_at')
    .single();

  if (error?.code === '23505') return res.status(409).json({ error: 'Ce nom d\'utilisateur existe déjà' });
  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'create_admin',
    target:   `admin:${data.id}`,
    details:  { created_username: username, role },
    ip:       getIP(req),
  });

  res.status(201).json(data);
});

/* ── Modifier un admin ── */
router.patch('/:id', async (req, res) => {
  const parsed = UpdateAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Données invalides' });

  const updates = { ...parsed.data };
  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, BCRYPT_ROUNDS);
    delete updates.password;
  }

  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, username, role, is_active')
    .single();

  if (error || !data) return res.status(404).json({ error: 'Admin introuvable' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'update_admin',
    target:   `admin:${req.params.id}`,
    details:  { fields: Object.keys(updates) },
    ip:       getIP(req),
  });

  res.json(data);
});

/* ── Supprimer un admin ── */
router.delete('/:id', async (req, res) => {
  // Empêche de supprimer son propre compte
  if (req.params.id === req.admin.id) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }

  const { data: target } = await supabase
    .from('admins')
    .select('username')
    .eq('id', req.params.id)
    .single();

  const { error } = await supabase.from('admins').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'delete_admin',
    target:   `admin:${req.params.id}`,
    details:  { deleted_username: target?.username },
    ip:       getIP(req),
  });

  res.json({ message: 'Admin supprimé' });
});

export default router;
