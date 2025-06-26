
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WebSocketConnectionProps {
  isConnected: boolean;
  playerCount: number;
  onRetryConnection?: () => void;
}

export const WebSocketConnection = ({ isConnected, playerCount, onRetryConnection }: WebSocketConnectionProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Badge className={`${isConnected ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
        {isConnected ? '🔴 LIVE WebSocket' : '❌ Disconnected'}
      </Badge>
      
      {!isConnected && onRetryConnection && (
        <Button 
          onClick={onRetryConnection}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
        >
          Retry Connection
        </Button>
      )}
      
      {isConnected && (
        <div className="text-sm text-slate-400">
          {playerCount}/2 players connected
        </div>
      )}
    </div>
  );
};
