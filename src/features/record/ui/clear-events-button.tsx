import { Ban } from 'lucide-react';
import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { useRecordingStore } from '../models/recording-store';
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
