import React from 'react';

const TYPE_CONFIG = {
  vouchers: {
    icon: 'local_activity',
    title: 'Chưa có voucher nào',
    description: 'Mua sắm voucher để nhận ưu đãi cực hời ngay hôm nay!'
  },
  orders: {
    icon: 'receipt_long',
    title: 'Chưa có đơn hàng nào',
    description: 'Lịch sử mua hàng của bạn đang trống. Hãy bắt đầu khám phá!'
  },
  cart: {
    icon: 'shopping_cart',
    title: 'Giỏ hàng trống',
    description: 'Chưa có sản phẩm nào trong giỏ hàng. Hãy lấp đầy nó thôi!'
  }
};

/**
 * CustomerEmptyState component displays styled illustrations and messages for empty states.
 *
 * @param {Object} props
 * @param {'vouchers' | 'orders' | 'cart'} [props.type] - Preset type
 * @param {string} [props.title] - Custom title (overrides type default)
 * @param {string} [props.description] - Custom description (overrides type default)
 * @param {React.ReactNode} [props.action] - Optional CTA button
 * @returns {React.ReactElement}
 */
export function CustomerEmptyState({ type, title, description, action }) {
  const config = TYPE_CONFIG[type] || {
    icon: 'database_off',
    title: 'Không có dữ liệu',
    description: 'Hiện chưa có nội dung nào để hiển thị.'
  };

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-fade-in">
      {/* Icon Sphere */}
      <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center shadow-md border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/60 font-light">
            {displayIcon}
          </span>
        </div>
      </div>

      {/* Headings */}
      <h3 className="font-headline-md text-[20px] text-on-surface mb-2 font-semibold leading-tight">
        {displayTitle}
      </h3>
      <p className="font-body-md text-[14px] text-on-surface-variant/80 max-w-sm mb-6 leading-relaxed">
        {displayDescription}
      </p>

      {/* Action Button */}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
