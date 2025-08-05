export type TRecordingOptions = {
  ignore: (url: string) => boolean;
  maxEvents?: number;
  includeHeaders?: boolean;
};
