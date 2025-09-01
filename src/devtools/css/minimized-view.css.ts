import { style } from '@vanilla-extract/css';

export const minimizedContainerStyle = style({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  zIndex: 10000,
  borderTop: '1px solid #374151',
  backgroundColor: 'oklch(0.205 0 0);',
  color: 'white',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
});
