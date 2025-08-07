import { useState } from 'react';
import { ClearEventsButton, ToggleRecordingButton, useRecordingStore } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';
import { combineStyles } from '@/shared/lib/utils';
import { Input, ResizableFrame } from '@/shared/ui';
import {
  activeTabStyle,
  headerStyle,
  inactiveTabStyle,
  mainContentStyle,
  scrollContentStyle,
  searchInputStyle,
  tabsContainerStyle,
  tabTriggerStyle,
  toolbarStyle,
} from './maximized-view.css';

const MaximizedView = () => {
  const [selectedTab, setSelectedTab] = useState<TTab>('all');
  const [searchValue, setSearchValue] = useState('');
  const { events } = useRecordingStore();

  const tabs = [
    { label: 'All', value: 'all', count: 5 },
    { label: 'HTTP', value: 'http', count: 2 },
    { label: 'Socket.io', value: 'socketio', count: 3 },
    { label: 'SSE', value: 'sse', count: 0 },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'all':
        return <div className={scrollContentStyle}>{JSON.stringify(events)}</div>;
      case 'http':
        return <div>HTTP</div>;
      case 'socketio':
        return <div>Socket.io</div>;
      case 'sse':
        return <div>SSE</div>;
      default:
        return <div>All</div>;
    }
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
