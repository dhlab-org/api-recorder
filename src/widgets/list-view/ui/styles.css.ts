import { style } from '@vanilla-extract/css';

export const listContainerStyle = style({
  overflow: 'auto',
  border: '1px solid #374151',
  borderRadius: '6px',
  backgroundColor: 'oklch(0.205 0 0)',
  height: '100%',
});

export const tableStyle = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
});

export const theadStyle = style({
  position: 'sticky',
  top: 0,
  backgroundColor: 'oklch(0.205 0 0)',
});

export const rowStyle = style({
  cursor: 'pointer',
  ':hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
});

export const rowSelectedStyle = style({
  backgroundColor: 'rgba(34,197,94,0.15)',
});

export const cellStyle = style({
  padding: '6px 8px',
  borderBottom: '1px solid #1f2937',
  color: 'white',
  verticalAlign: 'top',
});

export const nameCellStyle = style({
  fontWeight: '600',
});
