import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, Printer, FileText, FileDown } from 'lucide-react';

export type ExportActionsProps = {
  /**
   * pt-BR: Rótulo do botão principal.
   * en-US: Label of the main trigger button.
   */
  label?: string;
  /**
   * pt-BR: Callback para ação de impressão.
   * en-US: Callback for the print action.
   */
  onPrint?: () => void;
  /**
   * pt-BR: Callback para exportar em XLSX.
   * en-US: Callback to export as XLSX.
   */
  onExportXlsx?: () => void;
  /**
   * pt-BR: Callback para exportar em PDF.
   * en-US: Callback to export as PDF.
   */
  onExportPdf?: () => void;
  /**
   * pt-BR: Texto do item de menu para impressão.
   * en-US: Menu item text for the print action.
   */
  printLabel?: string;
  /**
   * pt-BR: Texto do item de menu para XLSX.
   * en-US: Menu item text for XLSX export.
   */
  xlsxLabel?: string;
  /**
   * pt-BR: Texto do item de menu para PDF.
   * en-US: Menu item text for PDF export.
   */
  pdfLabel?: string;
  /**
   * pt-BR: Desabilita o botão principal e o menu.
   * en-US: Disables the main button and the menu.
   */
  disabled?: boolean;
  /**
   * pt-BR: Classe CSS extra para o botão principal.
   * en-US: Extra CSS class for the trigger button.
   */
  className?: string;
  /**
   * pt-BR: Variante e tamanho do botão principal, herdados do Button.
   * en-US: Variant and size for the main button, inherited from Button.
   */
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

/**
 * ExportActions — Botão com dropdown de ações de exportação
 * pt-BR: Componente reutilizável que consolida ações como Imprimir, Exportar XLSX e Exportar PDF
 *        em um único botão com menu. Ideal para padronizar ações em listas e relatórios.
 * en-US: Reusable component that consolidates actions such as Print, Export XLSX, and Export PDF
 *        into a single button with a dropdown menu. Great for standardizing actions in lists and reports.
 */
export function ExportActions({
  label = 'Exportar',
  onPrint,
  onExportXlsx,
  onExportPdf,
  printLabel = 'Imprimir',
  xlsxLabel = 'Exportar XLSX',
  pdfLabel = 'Exportar PDF',
  disabled,
  className,
  variant = 'outline',
  size,
}: ExportActionsProps) {
  const anyAction = !!(onPrint || onExportXlsx || onExportPdf);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={disabled || !anyAction}>
          <Download className="w-4 h-4" />
          {label}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {onPrint && (
          <DropdownMenuItem onClick={onPrint}>
            <Printer className="w-4 h-4 mr-2" /> {printLabel}
          </DropdownMenuItem>
        )}
        {onExportXlsx && (
          <DropdownMenuItem onClick={onExportXlsx}>
            <FileDown className="w-4 h-4 mr-2" /> {xlsxLabel}
          </DropdownMenuItem>
        )}
        {onExportPdf && (
          <DropdownMenuItem onClick={onExportPdf}>
            <FileText className="w-4 h-4 mr-2" /> {pdfLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportActions;