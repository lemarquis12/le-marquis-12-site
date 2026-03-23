-- ══════════════════════════════════════════════════════════
--  SUPABASE SCHEMA — Communauté le_marquis_12
--  À coller dans : Supabase Dashboard → SQL Editor → Run
-- ══════════════════════════════════════════════════════════

-- Extension UUID (déjà active sur Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ──────────────────────────────────────────
--  TABLE : admins
--  Stocke les comptes administrateurs.
--  Le mot de passe est hashé côté Node.js (bcrypt)
--  avant insertion — jamais en clair ici.
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'admin'
                            CHECK (role IN ('superadmin','admin')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour recherche rapide par username
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Trigger : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ──────────────────────────────────────────
--  TABLE : sessions
--  Tokens de session générés à la connexion.
--  Vérifiés à chaque requête protégée.
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID        NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,   -- hash SHA-256 du token JWT
  ip_address    INET,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ                    -- NULL = session active
);

CREATE INDEX IF NOT EXISTS idx_sessions_token    ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_admin    ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires  ON sessions(expires_at);

-- Nettoyage automatique des sessions expirées (toutes les heures)
-- À activer via Supabase → Database → Extensions → pg_cron
-- SELECT cron.schedule('clean-sessions','0 * * * *',
--   $$DELETE FROM sessions WHERE expires_at < now() OR revoked_at IS NOT NULL$$);


-- ──────────────────────────────────────────
--  TABLE : login_logs
--  Historique de toutes les tentatives de
--  connexion (réussies ET échouées).
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_logs (
  id            BIGSERIAL   PRIMARY KEY,
  admin_id      UUID        REFERENCES admins(id) ON DELETE SET NULL,
  username_try  TEXT        NOT NULL,          -- username saisi (même si inconnu)
  success       BOOLEAN     NOT NULL,
  ip_address    INET,
  user_agent    TEXT,
  failure_reason TEXT,                         -- 'wrong_password' | 'unknown_user' | 'account_disabled'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_admin   ON login_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created ON login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_success ON login_logs(success);


-- ──────────────────────────────────────────
--  TABLE : action_logs
--  Trace chaque action effectuée dans
--  le panneau admin (qui, quoi, quand).
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS action_logs (
  id            BIGSERIAL   PRIMARY KEY,
  admin_id      UUID        NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  username      TEXT        NOT NULL,          -- dénormalisé pour lisibilité
  action        TEXT        NOT NULL,          -- 'save_news' | 'save_events' | 'add_item' | 'delete_item' | 'logout'
  target        TEXT,                          -- ex: 'shop_item:3' | 'news' | 'events'
  details       JSONB,                         -- données supplémentaires (ancien/nouveau contenu, etc.)
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_admin   ON action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_action  ON action_logs(action);
CREATE INDEX IF NOT EXISTS idx_action_logs_created ON action_logs(created_at DESC);


-- ──────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
--  Le client frontend n'accède JAMAIS à ces
--  tables directement — tout passe par Node.js
--  avec la service_role key.
--  On désactive le RLS public et on bloque tout.
-- ──────────────────────────────────────────
ALTER TABLE admins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Aucun accès via anon key (sécurité maximale)
CREATE POLICY "no_public_access_admins"      ON admins      FOR ALL USING (false);
CREATE POLICY "no_public_access_sessions"    ON sessions    FOR ALL USING (false);
CREATE POLICY "no_public_access_login_logs"  ON login_logs  FOR ALL USING (false);
CREATE POLICY "no_public_access_action_logs" ON action_logs FOR ALL USING (false);


-- ──────────────────────────────────────────
--  COMPTE SUPERADMIN PAR DÉFAUT
--  ⚠️  Remplacer le hash par celui généré via :
--      node -e "const b=require('bcrypt');b.hash('TON_MDP',12).then(console.log)"
--  Le hash ci-dessous correspond à "ChangeMe123!"
-- ──────────────────────────────────────────
INSERT INTO admins (username, password_hash, role)
VALUES (
  'admin',
  '$2b$12$placeholder_change_this_hash_before_going_live_xxxxxx',
  'superadmin'
)
ON CONFLICT (username) DO NOTHING;


-- ──────────────────────────────────────────
--  VUE : dashboard stats (lecture rapide)
-- ──────────────────────────────────────────
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM admins   WHERE is_active = true)                        AS active_admins,
  (SELECT COUNT(*) FROM sessions WHERE expires_at > now() AND revoked_at IS NULL) AS active_sessions,
  (SELECT COUNT(*) FROM login_logs WHERE created_at > now() - INTERVAL '24h')  AS logins_24h,
  (SELECT COUNT(*) FROM login_logs WHERE success = false AND created_at > now() - INTERVAL '24h') AS failed_logins_24h,
  (SELECT COUNT(*) FROM action_logs WHERE created_at > now() - INTERVAL '24h') AS actions_24h;


-- ──────────────────────────────────────────
--  TABLE : site_content
--  Stocke les contenus éditables (news, events)
--  en tant que paires clé/valeur HTML.
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT                          -- username du dernier éditeur
);

CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Valeurs initiales
INSERT INTO site_content (key, value) VALUES
  ('news',   ''),
  ('events', '')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access_site_content" ON site_content FOR ALL USING (false);


-- ──────────────────────────────────────────
--  TABLE : shop_items
--  Articles de la boutique
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  desc       TEXT        NOT NULL,
  price      NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  img        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
-- Les articles sont publics en lecture (pour le frontend sans auth)
CREATE POLICY "public_read_shop" ON shop_items FOR SELECT USING (true);
-- Seul le backend (service_role) peut écrire
CREATE POLICY "no_public_write_shop" ON shop_items FOR ALL USING (false);
