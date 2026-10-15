import { colors } from './index';
import { OrderStatus } from '../types/analytics';

export const STATUS_COLORS: Record<OrderStatus, string> = {
  delivered: colors.positive, shipped: colors.primary, confirmed: colors.teal,
  pending: colors.amber, cancelled: colors.negative, returned: colors.purple,
};
export const statusLabel = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
