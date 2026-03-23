// server/routes/admin.routes.js
import { Router }      from 'express';
import { z }           from 'zod';
import { supabase }    from '../db.js';
import { requireAuth } from '../auth.middleware.js';
import { logAction, getIP } from '../logger.js';

const router = Router();

// Toutes les routes de ce fichier nécessitent un token valide
router.use(requireAuth);

/* NEWS */
const ContentSchema = z.object({
  content: z.string().max(50000),
});

router.get('/news', async (req, res) => {
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'news')
    .single();
  res.json({ content: data?.value || '' });
});

router.put('/news', async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Contenu invalide' });

  const { content } = parsed.data;

  await supabase.from('site_content').upsert({ key: 'news', value: content }, { onConflict: 'key' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'save_news',
    target:   'news',
    details:  { length: content.length },
    ip:       getIP(req),
  });

  res.json({ message: 'Actualités sauvegardées' });
});

/* ════════════════════════════════════════
   EVENTS
════════════════════════════════════════ */
router.get('/events', async (req, res) => {
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'events')
    .single();
  res.json({ content: data?.value || '' });
});

router.put('/events', async (req, res) => {
  const parsed = ContentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Contenu invalide' });

  const { content } = parsed.data;

  await supabase.from('site_content').upsert({ key: 'events', value: content }, { onConflict: 'key' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'save_events',
    target:   'events',
    details:  { length: content.length },
    ip:       getIP(req),
  });

  res.json({ message: 'Évènements sauvegardés' });
});

/* ════════════════════════════════════════
   SHOP
════════════════════════════════════════ */
const ShopItemSchema = z.object({
  title: z.string().min(1).max(80).trim(),
  desc:  z.string().min(1).max(140).trim(),
  price: z.number().nonnegative().max(9999),
  img:   z.string().url().max(500).optional().or(z.literal('')),
});

// Lister tous les articles
router.get('/shop', async (req, res) => {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erreur BDD' });
  res.json(data || []);
});

// Ajouter un article
router.post('/shop', async (req, res) => {
  const parsed = ShopItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });

  const { data, error } = await supabase
    .from('shop_items')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'add_shop_item',
    target:   `shop_item:${data.id}`,
    details:  { title: data.title, price: data.price },
    ip:       getIP(req),
  });

  res.status(201).json(data);
});

// Modifier un article
router.put('/shop/:id', async (req, res) => {
  const parsed = ShopItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Données invalides' });

  const { data, error } = await supabase
    .from('shop_items')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Article introuvable' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'update_shop_item',
    target:   `shop_item:${req.params.id}`,
    details:  { title: data.title },
    ip:       getIP(req),
  });

  res.json(data);
});

// Supprimer un article
router.delete('/shop/:id', async (req, res) => {
  // Récupère l'article avant suppression (pour le log)
  const { data: item } = await supabase
    .from('shop_items')
    .select('title, price')
    .eq('id', req.params.id)
    .single();

  const { error } = await supabase
    .from('shop_items')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: 'Erreur BDD' });

  await logAction({
    adminId:  req.admin.id,
    username: req.admin.username,
    action:   'delete_shop_item',
    target:   `shop_item:${req.params.id}`,
    details:  item ? { title: item.title, price: item.price } : null,
    ip:       getIP(req),
  });

  res.json({ message: 'Article supprimé' });
});

export default router;
