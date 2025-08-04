import { RecordControllers } from './record-controllers';
import { SizeControllers } from './size-controllers';

const MinimizedView = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex justify-between items-center px-4 py-3">
      <RecordControllers />
      <SizeControllers buttons={['maximize', 'close']} />
    </div>
  );
};

export { MinimizedView };
