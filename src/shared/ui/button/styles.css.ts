import { style, styleVariants } from '@vanilla-extract/css';

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  ':disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },
  ':focus-visible': {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
  },
});

export const buttonVariants = styleVariants({
  default: {
    backgroundColor: '#3b82f6',
    color: 'white',
    ':hover': {
      backgroundColor: '#2563eb',
    },
  },
  destructive: {
    backgroundColor: '#ef4444',
    color: 'white',
    ':hover': {
      backgroundColor: '#dc2626',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'inherit',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    ':hover': {
      backgroundColor: '#e5e7eb',
    },
  },
});

export const buttonSizes = styleVariants({
  default: {
    height: '36px',
    padding: '8px 16px',
  },
  sm: {
    height: '32px',
    padding: '6px 12px',
    borderRadius: '6px',
    gap: '6px',
  },
  icon: {
    width: '36px',
    height: '36px',
    padding: '0',
  },
});
