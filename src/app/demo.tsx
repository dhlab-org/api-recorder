import { Button } from '@/shared/ui';

const Demo = () => {
  return (
    <div>
      <h1>Demo Page</h1>
      <Button
        onClick={() => {
          fetch('https://jsonplaceholder.typicode.com/posts/1')
            .then(res => res.json())
            .then(data => {
              console.log(data);
            });
        }}
      >
        Fetch
      </Button>
    </div>
  );
};

export { Demo };
