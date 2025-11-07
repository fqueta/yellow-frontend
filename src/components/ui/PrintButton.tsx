import React from "react";

/**
 * PrintButton
 *
 * Um botão reutilizável para acionar a impressão da página atual
 * utilizando o CSS de impressão do projeto. Opcionalmente, permite
 * executar callbacks antes e depois da impressão para ajustar o DOM,
 * como adicionar/remover classes ou preparar áreas específicas.
 */
export interface PrintButtonProps {
  /**
   * Rótulo do botão. Padrão: "Imprimir".
   */
  label?: string;
  /**
   * Classes adicionais para estilização (Tailwind/Custom).
   */
  className?: string;
  /**
   * Callback executado imediatamente antes de disparar window.print().
   */
  onBeforePrint?: () => void;
  /**
   * Callback executado após retorno de window.print().
   */
  onAfterPrint?: () => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  label = "Imprimir",
  className = "",
  onBeforePrint,
  onAfterPrint,
}) => {
  /**
   * handleClick
   *
   * Dispara os callbacks opcionais de preparação e conclusão de impressão
   * e em seguida chama window.print(). O botão recebe a classe `no-print`
   * para garantir que não apareça no documento impresso.
   */
  const handleClick = () => {
    try {
      onBeforePrint?.();
      window.print();
    } finally {
      onAfterPrint?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`no-print inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={label}
    >
      {/* Ícone simples de impressora (unicode) para evitar dependências */}
      <span aria-hidden>🖨️</span>
      <span>{label}</span>
    </button>
  );
};

export default PrintButton;