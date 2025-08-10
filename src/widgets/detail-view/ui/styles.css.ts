import { globalStyle, style } from '@vanilla-extract/css';

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
  backgroundColor: 'oklch(0.205 0 0)',
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

// Detail container
export const detailContainerStyle = style({
  overflow: 'auto',
  border: '1px solid #374151',
  borderRadius: '6px',
  background: 'oklch(0.205 0 0)',
  height: '100%',
});

// Section styles
export const sectionStyle = style({
  padding: '10px 12px',
});

export const sectionTitleStyle = style({
  margin: '12px 0 6px',
  fontWeight: '700',
  color: '#93c5fd',
});

export const grid2Style = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
});

// Header styles
export const headerStyle = style({
  padding: '14px 12px',
  borderBottom: '1px solid #1f2937',
  display: 'grid',
  rowGap: '16px',
});

export const badgeRowStyle = style({
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
});

export const badgeStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '11px',
  padding: '2px 8px',
  borderRadius: 999,
  color: 'white',
  border: '1px solid #29413a',
});

export const protoBadgeStyle = style({
  borderColor: '#2b3c2f',
  background: 'rgba(52,211,153,0.12)',
});

// Method badges
export const methodGet = style({ background: 'rgba(34,197,94,0.12)' });
export const methodPost = style({ background: 'rgba(59,130,246,0.12)' });
export const methodPut = style({ background: 'rgba(234,179,8,0.12)' });
export const methodDelete = style({ background: 'rgba(239,68,68,0.12)' });
export const methodPatch = style({ background: 'rgba(16,185,129,0.12)' });
export const methodOther = style({ background: 'rgba(148,163,184,0.12)' });

// Status badges
export const statusSuccess = style({ background: 'rgba(34,197,94,0.15)', borderColor: '#14532d' });
export const statusInfo = style({ background: 'rgba(59,130,246,0.15)', borderColor: '#0e3a5e' });
export const statusWarn = style({ background: 'rgba(234,179,8,0.15)', borderColor: '#5b4a0b' });
export const statusError = style({ background: 'rgba(239,68,68,0.15)', borderColor: '#5b0b0b' });
export const statusNeutral = style({ background: 'rgba(148,163,184,0.12)', borderColor: '#334155' });

export const urlRowStyle = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
});

export const urlTextStyle = style({
  color: 'white',
  fontSize: '12px',
  overflow: 'hidden',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
});

export const metaRowStyle = style({
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
});

export const metaItemStyle = style({
  display: 'grid',
  rowGap: '2px',
  fontSize: '11px',
  color: '#cbd5e1',
});

globalStyle(`${metaItemStyle} > code`, {
  color: 'white',
  background: 'rgba(255,255,255,0.06)',
  padding: '1px 6px',
  borderRadius: 4,
});

export const dividerStyle = style({
  height: 1,
  background: '#1f2937',
});

// Tab styles
export const tabsStyle = style({
  display: 'flex',
  gap: '4px',
  padding: '8px',
  borderBottom: '1px solid #1f2937',
});

const tabBase = style({
  fontWeight: '300',
  fontSize: '12px',
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
});

export const tabTriggerActiveStyle = style([
  tabBase,
  {
    color: 'white',
    backgroundColor: '#22c55e',
  },
]);

export const tabTriggerInactiveStyle = style([
  tabBase,
  {
    color: '#4ade80',
    ':hover': { color: 'white' },
  },
]);

// Utility styles
export const pillStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '11px',
  border: '1px solid #374151',
  borderRadius: 999,
  padding: '2px 8px',
  color: 'white',
  background: 'rgba(255,255,255,0.04)',
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
  maxHeight: 280,
  overflow: 'auto',
});

export const timingBarWrapStyle = style({
  marginTop: 12,
  height: 12,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid #1f2937',
  borderRadius: 6,
  overflow: 'hidden',
});

export const timingBarStyle = style({
  height: '100%',
  transition: 'width .2s',
});

// Table styles
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
