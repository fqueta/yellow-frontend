import React from 'react';

/**
 * WhatsAppFloatingButton
 * pt-BR: Botão flutuante fixo no canto inferior direito que abre o WhatsApp Web.
 * Recebe um `href` opcional; por padrão usa o link fornecido.
 * en-US: Floating fixed button at bottom-right that opens WhatsApp Web.
 * Accepts an optional `href`; defaults to the provided link.
 */
export interface WhatsAppFloatingButtonProps {
  href?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  href = 'https://wa.me/553208000004338?text=',
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      title="Fale conosco no WhatsApp"
      className="print-hidden fixed bottom-6 right-6 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      {/* Official WhatsApp logo (SVG). pt-BR: Ícone oficial do WhatsApp */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="26"
        height="26"
        aria-hidden="true"
        className="fill-current"
      >
        <path d="M20.52 3.48A11.76 11.76 0 0 0 12.04 0C5.47 0 .2 5.27.2 11.84c0 2.08.56 4.11 1.62 5.9L0 24l6.43-1.76a11.8 11.8 0 0 0 5.6 1.43h.01c6.57 0 11.84-5.27 11.84-11.84 0-3.17-1.23-6.15-3.36-8.28Zm-8.48 18.52h-.01A9.93 9.93 0 0 1 6.7 20.5l-.3-.18-3.82 1.05 1.02-3.72-.2-.31a9.92 9.92 0 0 1-1.54-5.3c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.92 7.02c0 5.49-4.46 9.96-9.95 9.96Zm5.45-7.46c-.3-.16-1.77-.87-2.04-.97-.27-.1-.47-.16-.67.16-.2.33-.77.96-.95 1.16-.18.19-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.47.13-.63.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.54-.07-.16-.66-1.6-.91-2.19-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.53.08-.81.38-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.26 3.16.15.2 2.16 3.3 5.22 4.63.73.31 1.3.5 1.74.64.73.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
      <span className="sr-only">WhatsApp</span>
    </a>
  );
};

export default WhatsAppFloatingButton;