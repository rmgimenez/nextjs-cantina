const mysql = require('mysql2/promise');

async function setupTestData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'sant31br',
    });

    console.log('Conectado ao banco de dados');

    // Inserir tipos de produto
    console.log('Inserindo tipos de produto...');
    await connection.execute(`
      INSERT IGNORE INTO cant_produto_tipo (id, descricao, codigo, exige_peso) VALUES
      (1, 'Salgados', 'salgados', 0),
      (2, 'Doces', 'doces', 0),
      (3, 'Bebidas', 'bebidas', 0),
      (4, 'Refeições', 'refeicoes', 1)
    `);

    // Inserir produtos
    console.log('Inserindo produtos...');
    await connection.execute(`
      INSERT IGNORE INTO cant_produtos (id, tipo_id, nome, descricao, preco_unitario, codigo_barra, estoque_minimo) VALUES
      (1, 1, 'Coxinha', 'Coxinha de frango tradicional', 4.50, '7891234567890', 10.000),
      (2, 1, 'Pastel de Queijo', 'Pastel frito recheado com queijo', 5.50, '7891234567891', 8.000),
      (3, 1, 'Pão de Açúcar', 'Pão doce tradicional', 3.00, '7891234567892', 15.000),
      (4, 2, 'Brigadeiro', 'Brigadeiro gourmet', 2.50, '7891234567893', 20.000),
      (5, 2, 'Bolo de Chocolate', 'Fatia de bolo de chocolate', 6.00, '7891234567894', 5.000),
      (6, 3, 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 5.00, '7891234567895', 24.000),
      (7, 3, 'Água 500ml', 'Água mineral natural', 2.00, '7891234567896', 50.000),
      (8, 3, 'Suco de Laranja', 'Suco natural de laranja', 4.00, '7891234567897', 12.000),
      (9, 4, 'Almoço Executivo', 'Refeição completa por quilo', 32.00, '7891234567898', 1.000)
      ON DUPLICATE KEY UPDATE
      nome = VALUES(nome),
      descricao = VALUES(descricao),
      preco_unitario = VALUES(preco_unitario),
      codigo_barra = VALUES(codigo_barra),
      estoque_minimo = VALUES(estoque_minimo)
    `);

    // Limpar movimentações existentes desses produtos
    console.log('Limpando movimentações antigas...');
    await connection.execute(`
      DELETE FROM cant_estoque_mov WHERE produto_id IN (1,2,3,4,5,6,7,8,9) AND referencia = 'ESTOQUE_INICIAL'
    `);

    // Inserir estoque inicial
    console.log('Inserindo estoque inicial...');
    await connection.execute(`
      INSERT INTO cant_estoque_mov (produto_id, tipo_mov, quantidade, referencia, observacao) VALUES
      (1, 'ENTRADA', 50.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (2, 'ENTRADA', 30.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (3, 'ENTRADA', 40.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (4, 'ENTRADA', 60.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (5, 'ENTRADA', 15.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (6, 'ENTRADA', 48.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (7, 'ENTRADA', 100.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (8, 'ENTRADA', 24.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
      (9, 'ENTRADA', 10.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto')
    `);

    // Verificar resultados
    console.log('\n=== Produtos inseridos ===');
    const [produtos] = await connection.execute(`
      SELECT p.id, p.nome, p.preco_unitario, t.descricao as categoria, 
             COALESCE(vs.saldo, 0) as estoque
      FROM cant_produtos p
      JOIN cant_produto_tipo t ON t.id = p.tipo_id
      LEFT JOIN cant_view_estoque_saldo vs ON vs.produto_id = p.id
      ORDER BY p.id
    `);
    console.table(produtos);

    await connection.end();
    console.log('\nDados de teste inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  }
}

setupTestData();
