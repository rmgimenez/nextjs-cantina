Produção - Como rodar
=====================

Arquivos adicionados:

- `run-prod.cmd` - script para Windows (cmd.exe). Executa: instala dependências se necessário, build e start.
- `run-prod.sh` - script para Unix (bash). Mesmo comportamento do script Windows.
- Atualizado `package.json` com script `prod` que executa `pnpm build && pnpm start`.

Uso (Windows - cmd.exe):

1. A partir da raiz do projeto execute:

```cmd
run-prod.cmd
```

Ou use o script npm:

```bash
pnpm prod
```

Uso (Linux/macOS):

```bash
chmod +x run-prod.sh
./run-prod.sh
```

Notas:

- Os scripts usam `pnpm` conforme convenção do projeto. Ajuste para `npm`/`yarn` se preferir.
- `run-prod.cmd` define `NODE_ENV=production` antes do build/start.
- Em ambientes de produção reais, recomenda-se usar um processo gerenciador (PM2, systemd, Docker, etc.) e proxy reverso (nginx).
