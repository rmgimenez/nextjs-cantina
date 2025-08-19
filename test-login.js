// Teste de login via fetch
const testLogin = async () => {
  try {
    console.log('Testando login...');

    // Primeiro, vamos fazer o login
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: 'admin',
        senha: 'admin123',
      }),
      // credentials não funciona em node-fetch como no browser
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));

    const loginData = await loginResponse.json();
    console.log('Login response data:', loginData);

    if (loginResponse.ok) {
      console.log('Login bem-sucedido! Testando sessão...');

      // Agora vamos verificar a sessão
      // Extrai cookie de sessão
      const setCookie = loginResponse.headers.get('set-cookie');
      let cookieHeader = '';
      if (setCookie) {
        cookieHeader = setCookie
          .split(',')
          .map((c) => c.split(';')[0])
          .join('; ');
      }

      const sessionResponse = await fetch('http://localhost:3000/api/session', {
        method: 'GET',
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      });

      console.log('Session response status:', sessionResponse.status);
      console.log(
        'Session response headers:',
        Object.fromEntries(sessionResponse.headers.entries())
      );

      const sessionData = await sessionResponse.json();
      console.log('Session response data:', sessionData);

      if (sessionResponse.ok) {
        console.log('✅ Teste bem-sucedido! A sessão está funcionando corretamente.');
      } else {
        console.log('❌ Falha na verificação de sessão.');
      }
    } else {
      console.log('❌ Falha no login.');
    }
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
};

// Executar o teste se estiver sendo executado diretamente
if (typeof window === 'undefined') {
  // Node.js environment (ESM fetch dynamic import for node-fetch v3)
  (async () => {
    if (!global.fetch) {
      const { default: fetchFn } = await import('node-fetch');
      // @ts-ignore
      global.fetch = fetchFn;
    }
    await testLogin();
  })();
} else {
  testLogin();
}

module.exports = testLogin;
