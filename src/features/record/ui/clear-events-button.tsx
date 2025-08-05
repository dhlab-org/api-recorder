import { Ban } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useRecordingStore } from '../models/recording-store';

const ClearEventsButton = () => {
  const { clearEvents } = useRecordingStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={clearEvents}
      className="ml-auto hover:bg-white/30 rounded-full hover:text-white h-7 w-7"
    >
      <Ban />
    </Button>
  );
};

export { ClearEventsButton };
