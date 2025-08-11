import { useMemo, useState } from 'react';
import { useRecordingStore } from '@/entities/record';
import { isSocketIOAvailable, SocketIOInstallPrompt } from '@/entities/websocket';
import { ExportButton } from '@/features/export';
import { ClearEventsButton, ToggleRecordingButton } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';
import { combineStyles } from '@/shared/lib/utils';
import { Input, ResizableFrame } from '@/shared/ui';
import { EventDetail } from '@/widgets/detail-view';
import { EventList } from '@/widgets/list-view';
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
  const { groupedEvents } = useRecordingStore();

  const tabs = [
    { label: 'All', value: 'all', count: groupedEvents.length },
    {
      label: 'HTTP',
      value: 'http',
      count: groupedEvents.filter(g => g.type === 'http-rest').length,
    },
    {
      label: 'Stream',
      value: 'stream',
      count: groupedEvents.filter(g => g.type === 'http-stream').length,
    },
    {
      label: 'Socket.io',
      value: 'socketio',
      count: groupedEvents.filter(g => g.type === 'socketio').length,
    },
  ];

  const filtered = useMemo(() => {
    return groupedEvents.filter(group => {
      if (selectedTab !== 'all') {
        if (selectedTab === 'http' && group.type !== 'http-rest') return false;
        if (selectedTab === 'stream' && group.type !== 'http-stream') return false;
        if (selectedTab === 'socketio' && group.type !== 'socketio') return false;
      }

      if (!searchValue) return true;
      const text = JSON.stringify(group).toLowerCase();
      return text.includes(searchValue.toLowerCase());
    });
  }, [groupedEvents, selectedTab, searchValue]);

  const selectedGroup = useMemo(
    () => groupedEvents.find(g => g.requestId === selectedRequestId),
    [groupedEvents, selectedRequestId],
  );

  const renderTabContent = () => {
    if (selectedTab === 'socketio' && !isSocketIOAvailable()) {
      return <SocketIOInstallPrompt />;
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedRequestId ? '1fr 1fr' : '1fr',
          height: '100%',
          gap: '8px',
        }}
      >
        <EventList groups={filtered} selectedRequestId={selectedRequestId} onSelectRequest={setSelectedRequestId} />
        {selectedRequestId && selectedGroup && <EventDetail group={selectedGroup} />}
      </div>
    );
  };

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
              onClick={() => {
                setSelectedTab(tab.value as TTab);
                setSelectedRequestId(null);
              }}
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

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <ExportButton />
          <ClearEventsButton />
        </div>
      </div>

      <div className={mainContentStyle}>{renderTabContent()}</div>
    </ResizableFrame>
  );
};

export { MaximizedView };

type TTab = 'all' | 'http' | 'stream' | 'socketio';
