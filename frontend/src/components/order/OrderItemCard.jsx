import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * OrderItemCard displays details of a voucher item within an order, cart, or checkout summary.
 *
 * @param {Object} props
 * @param {string} props.name - Name of the voucher product
 * @param {string} [props.image] - Image URL of the voucher product
 * @param {number} props.quantity - Quantity purchased
 * @param {number} [props.price] - Price of the item (unit price or total price)
 * @param {string} [props.partnerName] - Merchant or brand name
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function OrderItemCard({ name, image, quantity, price, partnerName, className = '' }) {
  return (
    <div className={`flex gap-4 items-center bg-surface-container-lowest p-3 rounded-lg shadow-sm border border-outline-variant/20 transition-all ${className}`}>
      {/* Product Image */}
      <div className="w-20 h-20 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 border border-outline-variant/10">
        <img
          alt={name || ''}
          className="w-full h-full object-cover"
          src={image || 'https://placehold.co/100x100?text=Voucher'}
        />
      </div>
      
      {/* Product Details */}
      <div className="flex-grow min-w-0">
        <h3 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight pr-2">
          {name}
        </h3>
        {partnerName && (
          <p className="text-xs text-on-surface-variant mt-0.5 truncate flex items-center gap-1 select-none">
            <span className="material-symbols-outlined text-[12px]">storefront</span>
            {partnerName}
          </p>
        )}
        <div className="flex justify-between items-center mt-2 gap-2">
          <span className="font-body-md text-sm text-on-surface-variant select-none">
            SL: {quantity}
          </span>
          {price !== undefined && price !== null && (
            <span className="font-price-display text-price-display text-primary select-all">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
