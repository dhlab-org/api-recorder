import { style } from '@vanilla-extract/css';

export const resizableFrame = style({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  zIndex: 10000,
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  backgroundColor: 'oklch(0.205 0 0);',
  color: 'white',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const resizeHandler = style({
  height: '12px',
  cursor: 'row-resize',
  border: 'none',
  outline: 'none',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const resizeHandle = style({
  height: '6px',
  width: '32px',
  borderRadius: '9999px',
  backgroundColor: '#6b7280',
});

export const content = style({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});
