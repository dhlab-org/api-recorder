import { style } from '@vanilla-extract/css';

export const copyBtnStyle = style({
  fontSize: '11px',
  border: '1px solid #334155',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  padding: '2px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  ':hover': { background: 'rgba(255,255,255,0.08)' },
});
