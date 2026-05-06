// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error capturado:', error);
    
    // Limpiar estado del DOM para evitar errores en cascada
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
    
    // Cerrar modales/portales
    const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
    modals.forEach(modal => {
      try {
        (modal as HTMLElement).style.display = 'none';
      } catch (e) {
        // Ignorar
      }
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">⚠️ Algo salió mal</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Error desconocido'}
        </p>
        <button
          onClick={() => {
            // Forzar limpieza antes de recargar
            document.body.style.overflow = 'auto';
            reset();
          }}
          className="px-6 py-3 bg-[var(--color-primario)] text-white rounded-lg hover:opacity-90 transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}