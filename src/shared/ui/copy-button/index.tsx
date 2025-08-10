import { copyBtnStyle } from './styles.css';

const CopyButton = ({ label, value }: TProps) => {
  return (
    <button
      type="button"
      className={copyBtnStyle}
      onClick={() => navigator.clipboard.writeText(value ?? '')}
      title="Copy"
    >
      {label}
    </button>
  );
};

export { CopyButton };

type TProps = {
  label: string;
  value: string;
};
