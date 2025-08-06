import { style } from '@vanilla-extract/css';

export const input = style({
  display: 'flex',
  height: '36px',
  width: '100%',
  minWidth: '0',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: 'transparent',
  padding: '8px 12px',
  fontSize: '14px',
  lineHeight: '1.5',
  color: 'inherit',
  outline: 'none',
  transition: 'color 0.2s, box-shadow 0.2s',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  '::placeholder': {
    color: '#9ca3af',
  },

  ':focus-visible': {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  ':disabled': {
    pointerEvents: 'none',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});
