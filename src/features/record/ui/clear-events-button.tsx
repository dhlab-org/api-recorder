import { Ban } from 'lucide-react';
import { useRecordingStore } from '@/entities/record';
import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { clearButtonStyle } from './clear-events-button.css';

const ClearEventsButton = () => {
  const { clearEvents } = useRecordingStore();

  return (
    <Button variant="ghost" size="icon" onClick={clearEvents} className={combineStyles(clearButtonStyle)}>
      <Ban />
    </Button>
  );
};

export { ClearEventsButton };
