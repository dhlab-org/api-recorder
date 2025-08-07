import { style } from '@vanilla-extract/css';

export const devtoolsButtonContainer = style({
  position: 'fixed',
  right: '16px',
  bottom: '16px',
  zIndex: 10001,
  transition: 'all 0.3s',
});

export const devtoolsButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#111827',
  color: 'white',
  border: '1px solid #374151',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  ':hover': {
    backgroundColor: '#1f2937',
  },
});

export const emojiIcon = style({
  fontSize: '18px',
});

export const buttonText = style({
  fontSize: '14px',
  fontWeight: '500',
});
