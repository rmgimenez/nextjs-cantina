const test = async () => {
  // Login
  const loginResponse = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'admin', senha: 'admin123' }),
  });

  const loginData = await loginResponse.json();
  console.log('Login response:', loginData);

  // Extrair o cookie da sessão
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  if (cookies) {
    const sessionCookie = cookies.split(';')[0];
    console.log('Session cookie:', sessionCookie);

    // Testar status do caixa
    const caixaResponse = await fetch('http://localhost:3000/api/pdv/caixa', {
      headers: { Cookie: sessionCookie },
    });
    const caixaData = await caixaResponse.json();
    console.log('Status do caixa:', caixaData);

    // Testar busca de produtos
    const produtosResponse = await fetch('http://localhost:3000/api/pdv/produtos', {
      headers: { Cookie: sessionCookie },
    });
    const produtosData = await produtosResponse.json();
    console.log('Produtos:', produtosData);
  }
};

test().catch(console.error);
