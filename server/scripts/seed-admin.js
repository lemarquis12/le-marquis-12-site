// server/scripts/seed-admin.js
// Usage : node scripts/seed-admin.js <username> <password>
// Ex:     node scripts/seed-admin.js admin MonMotDePasse123!

import 'dotenv/config';
import bcrypt       from 'bcrypt';
import { supabase } from '../db.js';

const [,, username = 'admin', password = 'ChangeMe123!'] = process.argv;

if (password.length < 8) {
  console.error('❌ Le mot de passe doit faire au moins 8 caractères.');
  process.exit(1);
}

console.log(`\n🔐 Création du compte superadmin "${username}"...`);

const hash = await bcrypt.hash(password, 12);

const { data, error } = await supabase
  .from('admins')
  .upsert(
    { username, password_hash: hash, role: 'superadmin', is_active: true },
    { onConflict: 'username' }
  )
  .select('id, username, role')
  .single();

if (error) {
  console.error('❌ Erreur Supabase :', error.message);
  process.exit(1);
}

console.log('✅ Compte créé/mis à jour :');
console.log(`   ID       : ${data.id}`);
console.log(`   Username : ${data.username}`);
console.log(`   Role     : ${data.role}`);
console.log('\n⚠️  Note: ne jamais commiter vos identifiants dans le repo.\n');
process.exit(0);
