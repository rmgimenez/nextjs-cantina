(async () => {
  const fetch = (await import('node-fetch')).default;
  try {
    console.log('Logando...');
    const loginRes = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'admin', senha: 'admin123' }),
    });
    console.log('Login status', loginRes.status);
    const loginBody = await loginRes.json().catch(() => null);
    console.log('Login body', loginBody);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('set-cookie header:', setCookie);
    let cookieHeader = '';
    if (setCookie)
      cookieHeader = setCookie
        .split(',')
        .map((c) => c.split(';')[0])
        .join('; ');

    console.log('Criando usuário...');
    const createRes = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        usuario: 'testuser',
        nome: 'Teste',
        tipo: 'ATENDENTE',
        senha: 'senha123',
      }),
    });
    console.log('Create status', createRes.status);
    const createBody = await createRes.json().catch(() => null);
    console.log('Create body', createBody);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
