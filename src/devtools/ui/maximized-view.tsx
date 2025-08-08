import { useMemo, useState } from 'react';
import { ClearEventsButton, ToggleRecordingButton, useRecordingStore } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';
import { combineStyles } from '@/shared/lib/utils';
import { Input, ResizableFrame } from '@/shared/ui';
import { EventsLog } from '@/widgets/events-log';
import {
  activeTabStyle,
  headerStyle,
  inactiveTabStyle,
  mainContentStyle,
  searchInputStyle,
  tabsContainerStyle,
  tabTriggerStyle,
  toolbarStyle,
} from './maximized-view.css';

const MaximizedView = () => {
  const [selectedTab, setSelectedTab] = useState<TTab>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { events } = useRecordingStore();

  const tabs = [
    { label: 'All', value: 'all', count: new Set(events.map(e => e.requestId)).size },
    {
      label: 'HTTP',
      value: 'http',
      count: new Set(events.filter(e => e.protocol === 'http').map(e => e.requestId)).size,
    },
    {
      label: 'Socket.io',
      value: 'socketio',
      count: new Set(events.filter(e => e.protocol === 'socketio').map(e => e.requestId)).size,
    },
    {
      label: 'SSE',
      value: 'sse',
      count: new Set(events.filter(e => e.protocol === 'readable-stream').map(e => e.requestId)).size,
    },
  ];

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (selectedTab !== 'all' && e.protocol !== (selectedTab === 'sse' ? 'readable-stream' : selectedTab)) {
        return false;
      }
      if (!searchValue) return true;
      const text = JSON.stringify(e).toLowerCase();
      return text.includes(searchValue.toLowerCase());
    });
  }, [events, selectedTab, searchValue]);

  const renderTabContent = () => (
    <EventsLog events={filtered} selectedRequestId={selectedRequestId} onSelectRequest={setSelectedRequestId} />
  );

  return (
    <ResizableFrame>
      <div className={headerStyle}>
        <ToggleRecordingButton />
        <UiModeControllers buttons={['minimize', 'close']} />
      </div>

      <div className={toolbarStyle}>
        <div className={tabsContainerStyle}>
          {tabs.map(tab => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedTab(tab.value as TTab)}
              className={combineStyles(tabTriggerStyle, tab.value === selectedTab ? activeTabStyle : inactiveTabStyle)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <Input
          placeholder="검색..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className={combineStyles(searchInputStyle)}
        />
        <ClearEventsButton />
      </div>

      <div className={mainContentStyle}>{renderTabContent()}</div>
    </ResizableFrame>
  );
};

export { MaximizedView };

type TTab = 'all' | 'http' | 'socketio' | 'sse';
