import * as React from 'react';
import { combineStyles } from '@/shared/lib/utils';
import { input } from './styles.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const inputClass = combineStyles(input, className);

  return <input ref={ref} className={inputClass} data-slot="input" {...props} />;
});

Input.displayName = 'Input';

export { Input };
