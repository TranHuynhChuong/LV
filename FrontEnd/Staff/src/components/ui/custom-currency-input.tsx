import CurrencyInput, { CurrencyInputProps } from 'react-currency-input-field';
import { cn } from '@/lib/utils';

type Props = Omit<CurrencyInputProps, 'className'> & {
  isInvalid?: boolean;
};

export default function CustomCurrencyInput({ isInvalid, ...props }: Props) {
  const inputClass = cn(
    'placeholder:text-muted-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    isInvalid &&
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
  );

  return <CurrencyInput className={inputClass} {...props} />;
}
