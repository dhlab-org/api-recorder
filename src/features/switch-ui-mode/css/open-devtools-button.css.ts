import { keyframes, style } from '@vanilla-extract/css';

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

const pulseAnimation = keyframes({
  '0%, 100%': {
    opacity: '1',
  },
  '50%': {
    opacity: '.5',
  },
});

export const recordingIndicatorStyle = style({
  height: '8px',
  width: '8px',
  borderRadius: '9999px',
  backgroundColor: '#ef4444',
  animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});
