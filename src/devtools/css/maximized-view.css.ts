import { style } from '@vanilla-extract/css';

export const headerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #374151',
  padding: '0 16px 12px',
  fontSize: '14px',
  flexShrink: 0,
});

export const toolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  gap: '20px',
  flexShrink: 0,
});

export const mainContentStyle = style({
  flex: '1',
  overflow: 'hidden',
  padding: '12px',
  paddingTop: '0',
});

export const tabsContainerStyle = style({
  backgroundColor: 'rgba(74, 222, 128, 0.05)',
  width: 'fit-content',
  borderRadius: '6px',
  display: 'flex',
  gap: '4px',
});

export const tabTriggerStyle = style({
  fontWeight: '300',
  fontSize: '12px',
  padding: '6px 12px',
  transition: 'colors 0.2s',
  borderRadius: '4px',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
});

export const activeTabStyle = style({
  color: 'white',
  backgroundColor: '#22c55e',
});

export const inactiveTabStyle = style({
  color: '#4ade80',
  ':hover': {
    color: 'white',
  },
});

export const scrollContentStyle = style({
  padding: '8px',
});
