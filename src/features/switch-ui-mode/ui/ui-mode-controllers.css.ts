import { style } from '@vanilla-extract/css';

export const controllersContainer = style({
  display: 'flex',
  gap: '8px',
  color: 'white !important',
});

export const controlButton = style({
  borderRadius: '9999px',
  padding: '3px',
  ':hover': {
    backgroundColor: '#86efac', // green-300
  },
});

export const closeButton = style({
  borderRadius: '9999px',
  ':hover': {
    backgroundColor: '#f87171', // red-400
  },
});
