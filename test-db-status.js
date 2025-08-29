const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'my-secret-pw',
      database: 'cantina',
    });

    console.log('=== Produtos ===');
    const [produtos] = await connection.execute('SELECT * FROM cant_produtos ORDER BY id');
    console.table(produtos);

    console.log('\n=== Tipos de Produto ===');
    const [tipos] = await connection.execute('SELECT * FROM cant_produto_tipo ORDER BY id');
    console.table(tipos);

    console.log('\n=== Estoque ===');
    const [estoque] = await connection.execute(
      'SELECT * FROM cant_view_estoque_saldo ORDER BY produto_id'
    );
    console.table(estoque);

    console.log('\n=== Status Caixa ===');
    const [caixa] = await connection.execute('SELECT * FROM cant_caixa WHERE status = "ABERTO"');
    console.table(caixa);

    await connection.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

testDB();
