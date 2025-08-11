const KV = ({ title, children }: TProps) => {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#93c5fd', marginBottom: 4 }}>{title}</div>
      <div style={{ color: 'white', fontSize: 12 }}>{children}</div>
    </div>
  );
};

export { KV };

type TProps = {
  title: string;
  children: React.ReactNode;
};
