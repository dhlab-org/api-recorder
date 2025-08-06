import { style } from '@vanilla-extract/css';

export const headerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #374151',
  padding: '0 16px 12px',
  fontSize: '14px',
});

export const contentStyle = style({
  padding: '12px 16px',
  flex: '1',
  height: '100%',
});

export const toolbarStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
});

export const tabsContainerStyle = style({
  backgroundColor: 'rgba(74, 222, 128, 0.05)', // bg-green-400/5
  width: 'fit-content',
  borderRadius: '6px',
});

export const tabsListStyle = style({
  display: 'flex',
  gap: '4px',
  backgroundColor: 'transparent',
});

export const tabTriggerStyle = style({
  fontWeight: '300',
  fontSize: '12px',
  padding: '0 8px',
  transition: 'colors 0.2s',
  borderRadius: '2px',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
});

export const activeTabStyle = style({
  color: 'white',
  backgroundColor: '#22c55e', // bg-green-500
});

export const inactiveTabStyle = style({
  color: '#4ade80', // text-green-400
  ':hover': {
    color: 'white',
  },
});

export const searchInputStyle = style({
  fontSize: '12px',
  backgroundColor: '#1f2937', // bg-gray-800
  borderColor: '#4b5563', // border-gray-600
  color: 'white',
  width: '144px', // w-36
});

export const tabsContentStyle = style({
  overflow: 'hidden',
  height: '100%',
});

export const scrollContainerStyle = style({
  height: '100%',
  overflow: 'auto',
});

export const scrollContentStyle = style({
  padding: '8px',
});
