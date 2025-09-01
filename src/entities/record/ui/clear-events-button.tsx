import { Ban } from 'lucide-react';
import { useEventStore } from '@/entities/event';
import { combineStyles } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { clearButtonStyle } from '../css/clear-events-button.css';

const ClearEventsButton = () => {
  const { clearEvents } = useEventStore();

  return (
    <Button variant="ghost" size="icon" onClick={clearEvents} className={combineStyles(clearButtonStyle)}>
      <Ban />
    </Button>
  );
};

export { ClearEventsButton };
