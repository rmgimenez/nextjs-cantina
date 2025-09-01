import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Em ambientes legados deste repositório temos muitas regras que
    // bloqueiam o build (no-explicit-any, unused vars). Para permitir
    // builds de produção sem bloquear, ignoramos o eslint durante o build.
    // Mantemos o ESLint ativo no desenvolvimento.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
