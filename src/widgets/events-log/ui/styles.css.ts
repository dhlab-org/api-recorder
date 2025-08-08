import { style } from '@vanilla-extract/css';

// Header row (tabs + search + actions)
export const headerRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px',
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
  padding: '3px 12px',
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

export const searchInputStyle = style({
  fontSize: '12px',
  backgroundColor: '#1f2937',
  borderColor: '#4b5563',
  color: 'white',
  width: '144px',
});

// Main grid
export const gridStyle = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  height: '100%',
  gap: '8px',
});

export const listContainerStyle = style({
  overflow: 'auto',
  border: '1px solid #374151',
  borderRadius: '6px',
});

export const tableStyle = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
});

export const theadStyle = style({
  position: 'sticky',
  top: 0,
  background: '#111827',
});

export const rowStyle = style({
  cursor: 'pointer',
  selectors: {
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
  },
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

export const detailContainerStyle = style({
  overflow: 'auto',
  border: '1px solid #374151',
  borderRadius: '6px',
  padding: '8px',
});

export const sectionTitleStyle = style({
  margin: '12px 0 6px',
  fontWeight: '700',
  color: '#93c5fd',
});

export const kvTableStyle = style({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
});

export const kvCellKeyStyle = style({
  width: '160px',
  padding: '4px 6px',
  color: '#9ca3af',
  borderBottom: '1px solid #1f2937',
});

export const kvCellValStyle = style({
  padding: '4px 6px',
  color: 'white',
  borderBottom: '1px solid #1f2937',
  wordBreak: 'break-all',
});

export const codeBoxStyle = style({
  padding: '8px',
  borderRadius: '6px',
  background: '#0b1220',
  border: '1px solid #1f2937',
  color: 'white',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '12px',
  whiteSpace: 'pre-wrap',
});
