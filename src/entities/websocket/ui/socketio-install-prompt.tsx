import { Package } from 'lucide-react';

const SocketIOInstallPrompt = () => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '16px',
        }}
      >
        <Package size={48} color="#666" />
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>
            Socket.IO 통신을 기록하려면 socket.io-client 패키지를 설치해야 합니다.
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>yarn add socket.io-client</p>
        </div>
      </div>
    </div>
  );
};

export { SocketIOInstallPrompt };

export const isSocketIOAvailable = (): boolean => {
  try {
    require('socket.io-client');
    return true;
  } catch {
    return false;
  }
};
