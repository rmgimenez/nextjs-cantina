"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Importa o bundle do Bootstrap (JS + Popper) dinamicamente apenas no client
    import("bootstrap/dist/js/bootstrap.bundle.min.js" as string).catch(
      (err: unknown) => {
        console.error("Falha ao carregar o JS do Bootstrap:", err);
      }
    );
  }, []);

  return null;
}
