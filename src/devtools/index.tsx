import { cn } from '@/shared/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui';
import { useDevtoolsViewStore } from './models/devtools-view-store';
import type { TTab } from './types';
import { RecordControllers } from './ui/record-controllers';
import { ResizablePanel } from './ui/resizable-panel';
import { FloatingButton, SizeControllers } from './ui/size-controllers';

const Devtools = () => {
  const { view, tab: selectedTab, setTab } = useDevtoolsViewStore();

  return (
    <div>
      {view === 'closed' && <FloatingButton />}
      {view === 'maximized' && (
        <ResizablePanel>
          <div className="flex items-center justify-between border-b border-gray-700 px-4 pb-3 text-sm">
            <RecordControllers />
            <SizeControllers buttons={['minimize', 'close']} />
          </div>
          <div className="py-3 px-4">
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
            <div className="overflow-hidden min-h-0">
              <Tabs value={selectedTab} className="h-full">
                <TabsContent value="all" className="h-full mt-0">
                  <div>All</div>
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
        </ResizablePanel>
      )}

      {view === 'minimized' && (
        <div className="fixed bottom-0 left-0 right-0 z-[10000] border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex justify-between items-center px-4 py-3">
          <RecordControllers />
          <SizeControllers buttons={['maximize', 'close']} />
        </div>
      )}
    </div>
  );
};

export { Devtools };
