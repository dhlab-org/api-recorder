import { style } from '@vanilla-extract/css';

export const clearButtonStyle = style({
  marginLeft: 'auto',
  height: '28px',
  width: '28px',
  borderRadius: '9999px',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
  },
});
