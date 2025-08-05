import { useState } from 'react';
import { ClearEventsButton, ToggleRecordButton, useRecordingStore } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';
import { cn } from '@/shared/lib';
import { Input, ResizableFrame, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui';
import { useDevtoolsViewStore } from '../models/devtools-view-store';
import type { TTab } from '../types';

const MaximizedView = () => {
  const { tab: selectedTab, setTab } = useDevtoolsViewStore();
  const [searchValue, setSearchValue] = useState('');
  const { events } = useRecordingStore();

  return (
    <ResizableFrame>
      <div className="flex items-center justify-between border-b border-gray-700 px-4 pb-3 text-sm">
        <ToggleRecordButton />
        <UiModeControllers buttons={['minimize', 'close']} />
      </div>
      <div className="py-3 px-4 flex-1 h-full">
        <div className="flex items-center justify-between gap-5">
          <Tabs
            value={selectedTab}
            onValueChange={value => setTab(value as TTab)}
            className="bg-green-400/5 w-fit rounded-md"
          >
            <TabsList className="flex gap-1 bg-transparent">
              {[
                { label: 'All', value: 'all', count: 5 },
                { label: 'HTTP', value: 'http', count: 2 },
                { label: 'Socket.io', value: 'socketio', count: 3 },
                { label: 'SSE', value: 'sse', count: 0 },
              ].map(tab => (
                <TabsTrigger
                  key={tab.label}
                  value={tab.value}
                  className={cn(
                    'font-light text-xs px-2 py-0 transition-colors rounded-sm cursor-pointer',
                    tab.value === selectedTab ? 'text-white bg-green-500!' : 'text-green-400 hover:text-white',
                  )}
                >
                  {tab.label} ({tab.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input
            placeholder="검색..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="text-xs bg-gray-800 border-gray-600 text-white w-36"
          />
          <ClearEventsButton />
        </div>

        <div className="overflow-hidden h-full">
          <Tabs value={selectedTab} className="h-full">
            <TabsContent value="all" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div>{JSON.stringify(events)}</div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="http" className="h-full mt-0">
              <div>HTTP</div>
            </TabsContent>
            <TabsContent value="socketio" className="h-full mt-0">
              <div>Socket.io</div>
            </TabsContent>
            <TabsContent value="sse" className="h-full mt-0">
              <div>SSE</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ResizableFrame>
  );
};

export { MaximizedView };
