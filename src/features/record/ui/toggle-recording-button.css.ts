import { keyframes, style } from '@vanilla-extract/css';

export const containerStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const toggleButtonStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  border: '2px solid',
});

export const defaultButtonStyle = style({
  borderColor: '#16a34a', // green-600
});

export const recordingButtonStyle = style({
  borderColor: '#dc2626', // red-700
});

export const iconContainerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const playIconStyle = style({
  height: '12px',
  width: '12px',
  borderRadius: '9999px',
  backgroundColor: '#16a34a', // green-600
});

export const stopIconStyle = style({
  height: '12px',
  width: '12px',
  backgroundColor: 'white',
  borderRadius: '2px',
});

export const buttonTextStyle = style({
  fontWeight: 'bold',
  letterSpacing: '0.05em',
});

export const statusContainerStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
});

export const statusIndicatorStyle = style({
  height: '8px',
  width: '8px',
  borderRadius: '9999px',
});

export const waitingIndicatorStyle = style({
  backgroundColor: '#9ca3af', // gray-400
});

export const pulseAnimation = keyframes({
  '0%, 100%': {
    opacity: '1',
  },
  '50%': {
    opacity: '.5',
  },
});

export const recordingIndicatorStyle = style({
  backgroundColor: '#ef4444', // red-500
  animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});

export const statusTextStyle = style({
  fontWeight: '500',
  letterSpacing: '0.025em',
});

export const waitingTextStyle = style({
  color: '#6b7280', // muted-foreground
});

export const recordingTextStyle = style({
  color: '#dc2626', // red-600
});
