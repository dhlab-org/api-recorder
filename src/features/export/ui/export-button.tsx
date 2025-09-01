import { Download } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useExportEvents } from '../hooks/use-export-events';

const ExportButton = () => {
  const { handleExport } = useExportEvents();

  return (
    <Button variant="ghost" size="icon" onClick={handleExport}>
      <Download />
    </Button>
  );
};

export { ExportButton };
