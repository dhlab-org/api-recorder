import { copyBtnStyle } from './styles.css';

const CopyButton = ({ label, value }: TProps) => {
  return (
    <button
      type="button"
      className={copyBtnStyle}
      onClick={() => {
        const text = typeof value === 'function' ? value() : value;
        void navigator.clipboard.writeText(text ?? '');
      }}
      title="Copy"
    >
      {label}
    </button>
  );
};

export { CopyButton };

type TProps = {
  label: string;
  value: string | (() => string);
};
