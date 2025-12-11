import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export type PerPageValue = number | 'all';

interface PerPageSelectorProps {
  /**
   * pt-BR: Valor selecionado do seletor (número de itens por página ou 'all' para todos).
   * en-US: Selected value for the selector (items per page number or 'all' for all).
   */
  value: PerPageValue;
  /**
   * pt-BR: Callback disparado quando o usuário altera o valor.
   * en-US: Callback fired when the user changes the value.
   */
  onChange: (value: PerPageValue) => void;
  /**
   * pt-BR: Opções disponíveis no seletor. Por padrão: [20, 50, 100, 200, 500, 'all'].
   * en-US: Available options for the selector. Default: [20, 50, 100, 200, 500, 'all'].
   */
  options?: PerPageValue[];
  /**
   * pt-BR: Rótulo exibido acima do seletor. Default: "Por página".
   * en-US: Label displayed above the selector. Default: "Per page".
   */
  label?: string;
  /**
   * pt-BR: Classes adicionais para o container do componente.
   * en-US: Additional classes for the component container.
   */
  className?: string;
}

/**
 * pt-BR: Componente reutilizável de seleção de itens por página, seguindo o estilo do sistema.
 * - Exibe um dropdown com opções numéricas e a opção "Todos".
 * - Aceita `number` ou `'all'` como valor e chama `onChange` ao alterar.
 *
 * en-US: Reusable per-page selector component matching system styling.
 * - Renders a dropdown with numeric options and the "All" option.
 * - Accepts `number` or `'all'` as value and calls `onChange` on change.
 */
export const PerPageSelector: React.FC<PerPageSelectorProps> = ({
  value,
  onChange,
  options = [50, 20, 100, 200, 500, 'all'],
  label = 'Por página',
  className,
}) => {
  // pt-BR: Normaliza a exibição do valor atual no gatilho do Select.
  // en-US: Normalizes the current value display inside the Select trigger.
  const currentLabel = value === 'all' ? 'Todos' : String(value);

  return (
    <div className={className}>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Select
        value={String(value)}
        onValueChange={(val) => {
          const parsed: PerPageValue = val === 'all' ? 'all' : Number(val);
          onChange(parsed);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={currentLabel} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt)} value={String(opt)}>
              {opt === 'all' ? 'Todos' : String(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PerPageSelector;