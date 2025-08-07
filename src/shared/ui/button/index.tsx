import * as React from 'react';
import { combineStyles } from '@/shared/lib/utils';
import { button, buttonSizes, buttonVariants } from './styles.css';

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className, ...props }, ref) => {
    const buttonClass = combineStyles(button, buttonVariants[variant], buttonSizes[size], className);

    return <button ref={ref} className={buttonClass} data-slot="button" {...props} />;
  },
);

Button.displayName = 'Button';

export { Button };
