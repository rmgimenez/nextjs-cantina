import 'dotenv/config';
import db from '../src/lib/db.js';

(async function run() {
  try {
    await db.testConnection();
    console.log('Conexão com MySQL testada com sucesso.');
  } catch (err) {
    console.error('Erro ao testar conexão:', err);
    process.exitCode = 1;
  }
})();
