import { ToggleRecordingButton } from '@/features/record';
import { UiModeControllers } from '@/features/switch-ui-mode';
import { minimizedContainerStyle } from '../css/minimized-view.css';

const MinimizedView = () => {
  return (
    <div className={minimizedContainerStyle}>
      <ToggleRecordingButton />
      <UiModeControllers buttons={['maximize', 'close']} />
    </div>
  );
};

export { MinimizedView };
