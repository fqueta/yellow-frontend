import { Controller, Control } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMask } from "@react-input/mask";

type MaskedInputFieldProps = {
  name: string;
  control: Control<any>; // pode tipar com seu schema
  label: string;
  mask: string;
  placeholder?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export function MaskedInputField({
  name,
  control,
  label,
  mask,
  placeholder,
  onBlur,
  disabled,
}: MaskedInputFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <InputMask
                  mask={mask}
                  replacement={{ _: /\d/ }}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  placeholder={placeholder}
                  ref={field.ref}
                />
            )}
            />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
