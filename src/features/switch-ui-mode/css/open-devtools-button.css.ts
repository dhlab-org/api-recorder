import { style } from '@vanilla-extract/css';

export const devtoolsButtonContainer = style({
  position: 'fixed',
  right: '16px',
  bottom: '16px',
  zIndex: 10001,
  transition: 'all 0.3s',
  backgroundColor: 'oklch(0.205 0 0);',
  borderRadius: '6px',
});

export const devtoolsButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'oklch(0.205 0 0);',
  color: 'white',
  border: '1px solid #374151',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  ':hover': {
    backgroundColor: 'oklch(0.250 0 0);',
  },
});

export const emojiIcon = style({
  fontSize: '18px',
});

export const buttonText = style({
  fontSize: '14px',
  fontWeight: '500',
});
