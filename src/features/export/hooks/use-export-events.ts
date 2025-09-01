import { useEventStore } from '@/entities/event';

const useExportEvents = () => {
  const { groupedEvents } = useEventStore();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(groupedEvents, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { handleExport };
};

export { useExportEvents };
