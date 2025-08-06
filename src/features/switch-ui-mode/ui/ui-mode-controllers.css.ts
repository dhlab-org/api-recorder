import { style } from '@vanilla-extract/css';

export const controllersContainer = style({
  display: 'flex',
  gap: '8px',
});

export const controlButton = style({
  borderRadius: '9999px',
  height: '20px',
  width: '20px',
  ':hover': {
    backgroundColor: '#86efac', // green-300
  },
});

export const closeButton = style({
  borderRadius: '9999px',
  height: '20px',
  width: '20px',
  ':hover': {
    backgroundColor: '#f87171', // red-400
  },
});
