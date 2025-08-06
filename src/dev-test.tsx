import { createRoot } from 'react-dom/client';
import { ApiRecorderDevtools } from './index';

const App = () => {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', padding: '20px' }}>Testing...</h1>
      <ApiRecorderDevtools />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
