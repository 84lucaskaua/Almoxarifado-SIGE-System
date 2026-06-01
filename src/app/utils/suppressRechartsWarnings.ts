/**
 * Supressor de warnings conhecidos do Recharts
 * Esses warnings são gerados internamente pela biblioteca e não afetam a funcionalidade
 */

const originalConsoleError = console.error;

export function suppressRechartsWarnings() {
  console.error = (...args: any[]) => {
    // Suprimir warnings específicos do Recharts sobre keys duplicadas
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered two children with the same key')
    ) {
      // Ignorar este warning específico do Recharts
      return;
    }
    
    // Passar todos os outros erros normalmente
    originalConsoleError.apply(console, args);
  };
}

export function restoreConsoleError() {
  console.error = originalConsoleError;
}
