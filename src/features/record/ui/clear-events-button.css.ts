import { style } from '@vanilla-extract/css';

export const clearButtonStyle = style({
  marginLeft: 'auto',
  height: '22px',
  width: '22px',
  padding: '3px',
  borderRadius: '9999px',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
  },
});
