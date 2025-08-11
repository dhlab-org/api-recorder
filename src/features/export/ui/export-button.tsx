import { Download } from 'lucide-react';
import { useRecordingStore } from '@/entities/record';
import { Button } from '@/shared/ui';

const ExportButton = () => {
  const { events } = useRecordingStore();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleExport}>
      <Download />
    </Button>
  );
};

export { ExportButton };
