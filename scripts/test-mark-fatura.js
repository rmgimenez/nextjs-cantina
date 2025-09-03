// Script de teste: loga como admin, lista faturas do mês corrente, e marca a primeira como paga
(async () => {
  if (!global.fetch) {
    const { default: fetchFn } = await import('node-fetch');
    global.fetch = fetchFn;
  }
  try {
    console.log('Fazendo login...');
    const loginRes = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'admin', senha: 'admin123' }),
    });
    const setCookie = loginRes.headers.get('set-cookie') || '';
    console.log('login status', loginRes.status, 'set-cookie:', setCookie ? 'ok' : 'no-cookie');

    const cookieHeader = setCookie
      ? setCookie
          .split(',')
          .map((c) => c.split(';')[0])
          .join('; ')
      : '';

    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth() + 1;
    console.log('Buscando faturas', ano, mes);
    const listRes = await fetch(
      `http://localhost:3000/api/relatorios/funcionarios/faturas?ano=${ano}&mes=${mes}`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    );
    const listJson = await listRes.json();
    console.log('list status', listRes.status);
    console.log(listJson);
    const faturas = listJson.faturas || [];
    if (faturas.length === 0) {
      console.log('Nenhuma fatura encontrada. Gerando faturas e tentando novamente...');
      const genRes = await fetch('http://localhost:3000/api/relatorios/funcionarios/faturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ ano, mes }),
      });
      console.log('gerar status', genRes.status);
      const listRes2 = await fetch(
        `http://localhost:3000/api/relatorios/funcionarios/faturas?ano=${ano}&mes=${mes}`,
        {
          headers: cookieHeader ? { Cookie: cookieHeader } : {},
        }
      );
      const j2 = await listRes2.json();
      console.log('list after gen', j2);
      if ((j2.faturas || []).length === 0) {
        console.log('Ainda sem faturas. Abortando.');
        return;
      }
      faturas.push(...j2.faturas);
    }
    const primeiro = faturas[0];
    console.log('Marcando fatura id', primeiro.id, 'como PAGA');
    // Fazer POST action com timeout para evitar hangs
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const postRes = await fetch('http://localhost:3000/api/relatorios/funcionarios/faturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ action: 'marcar_paga', id: primeiro.id }),
      signal: controller.signal,
    }).catch((err) => {
      return { ok: false, status: 'error', err };
    });
    clearTimeout(timeout);
    console.log('post result', postRes && postRes.status ? postRes.status : postRes);
    try {
      console.log(await postRes.json());
    } catch (e) {
      console.log('no-json');
    }

    // Recarregar faturas para confirmar
    const confirmRes = await fetch(
      `http://localhost:3000/api/relatorios/funcionarios/faturas?ano=${ano}&mes=${mes}`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    );
    const confirmJson = await confirmRes.json();
    console.log('Confirm faturas:', confirmJson.faturas);
  } catch (err) {
    console.error('Erro no script de teste', err);
  }
})();
