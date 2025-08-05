import { useApiRecorder } from '@/features/record';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

const RecordControllers = () => {
  const { isRecording, start, stop } = useApiRecorder();

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        variant={isRecording ? 'destructive' : 'default'}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all border-2',
          isRecording ? ' border-red-700 ' : 'border-green-600',
        )}
        onClick={() => (isRecording ? stop() : start())}
      >
        {isRecording ? (
          <div className="flex items-center justify-center">
            <div className="h-3 w-3 bg-white rounded-sm" />
          </div>
        ) : (
          <div className="h-3 w-3 rounded-full bg-green-600" />
        )}
        <span className="font-bold tracking-wider">{isRecording ? '녹화 종료' : '녹화 시작'}</span>
      </Button>

      <div className="flex items-center gap-2 text-xs">
        <div className={cn('h-2 w-2 rounded-full', isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400')} />
        <span className={cn('font-medium tracking-wide', isRecording ? 'text-red-600' : 'text-muted-foreground')}>
          {isRecording ? 'LIVE • API 기록 중' : '대기 중'}
        </span>
      </div>
    </div>
  );
};

export { RecordControllers };
