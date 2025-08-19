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
      credentials: 'include',
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));

    const loginData = await loginResponse.json();
    console.log('Login response data:', loginData);

    if (loginResponse.ok) {
      console.log('Login bem-sucedido! Testando sessão...');

      // Agora vamos verificar a sessão
      const sessionResponse = await fetch('http://localhost:3000/api/session', {
        method: 'GET',
        credentials: 'include',
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
  // Node.js environment
  const fetch = require('node-fetch');
  testLogin();
} else {
  // Browser environment
  testLogin();
}

module.exports = testLogin;
