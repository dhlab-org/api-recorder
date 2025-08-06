export const combineStyles = (...styles: (string | undefined | null | false)[]) => {
  return styles.filter(Boolean).join(' ');
};
