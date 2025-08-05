import { ToggleRecordingButton } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';

const MinimizedView = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] border-t border-gray-700 bg-gray-900 text-white shadow-2xl flex justify-between items-center px-4 py-3">
      <ToggleRecordingButton />
      <UiModeControllers buttons={['maximize', 'close']} />
    </div>
  );
};

export { MinimizedView };
