require('dotenv').config();
const db = require('../src/lib/db.cjs');

console.log('DEBUG: env ->', {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  passwordSet: !!process.env.DATABASE_PASSWORD,
});

(async function run() {
  try {
    await db.testConnection();
    console.log('Conexão com MySQL testada com sucesso.');
  } catch (err) {
    console.error('Erro ao testar conexão:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
