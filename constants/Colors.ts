export const Colors = {
  primary: {
    DEFAULT: '#FF6B00',
    50: '#FFF3E9',
    100: '#FFE7D3',
    200: '#FFCFA6',
    300: '#FFB679',
    400: '#FF9E4D',
    500: '#FF8520',
    600: '#FF6B00',
    700: '#CC5600',
    800: '#994000',
    900: '#662B00',
  },
  success: {
    DEFAULT: '#22C55E',
    50: '#E8F9EE',
    100: '#D0F4DD',
    200: '#A1E8BC',
    300: '#71DD9A',
    400: '#42D179',
    500: '#22C55E',
    600: '#1B9E4B',
    700: '#137639',
    800: '#0C4F26',
    900: '#062713',
  },
  error: {
    DEFAULT: '#EF4444',
    50: '#FEEAEA',
    100: '#FED4D4',
    200: '#FDA9A9',
    300: '#FC7F7F',
    400: '#FB5454',
    500: '#EF4444',
    600: '#C41A1A',
    700: '#A31414',
    800: '#730E0E',
    900: '#420808',
  },
  warning: {
    DEFAULT: '#F59E0B',
    50: '#FEF5E7',
    100: '#FDECCE',
    200: '#FCD89D',
    300: '#FAC56D',
    400: '#F7B23C',
    500: '#F59E0B',
    600: '#C47F08',
    700: '#935F06',
    800: '#624004',
    900: '#312002',
  },
  info: {
    DEFAULT: '#3B82F6',
    50: '#EAF2FE',
    100: '#D5E5FD',
    200: '#ABCBFB',
    300: '#81B1FA',
    400: '#5797F8',
    500: '#3B82F6',
    600: '#0B62EF',
    700: '#084CBD',
    800: '#06378A',
    900: '#042158',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#111827',
  border: '#E5E7EB',
  notification: '#FF6B00',
};

export const StatusColors = {
  available: Colors.success.DEFAULT,
  unavailable: Colors.gray[400],
  pending: Colors.warning.DEFAULT,
  completed: Colors.success.DEFAULT,
  ongoing: Colors.info.DEFAULT,
  upcoming: Colors.primary.DEFAULT,
  delivered: Colors.success.DEFAULT,
  delayed: Colors.error.DEFAULT,
};

export default Colors;