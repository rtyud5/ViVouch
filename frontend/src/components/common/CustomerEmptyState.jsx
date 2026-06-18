import React from 'react';

/**
 * CustomerEmptyState component renders a premium, branded empty state container
 * adapted from the shopping cart empty state mockup.
 *
 * @param {Object} props
 * @param {string} props.title - The main heading
 * @param {string} [props.description] - Subtext or action guidance
 * @param {string} [props.icon='local_activity'] - Material symbols icon name
 * @param {React.ReactNode} [props.action] - Optional CTA button or element
 */
export function CustomerEmptyState({ title, description, icon = 'local_activity', action }) {
  return (
    <div className="flex flex-col justify-center items-center py-16 px-4 text-center w-full">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Illustration / Circle Icon Wrapper */}
        <div className="w-48 h-48 mb-8 bg-surface-container-low rounded-full flex items-center justify-center shadow-inner relative overflow-hidden border border-outline-variant/10">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]"></div>
          
          <span className="material-symbols-outlined text-[80px] text-outline-variant opacity-80 select-none" style={{ fontVariationSettings: "'wght' 200" }}>
            {icon}
          </span>
          
          {/* Decorative small circles with animation */}
          <div className="absolute top-8 right-10 w-3 h-3 bg-tertiary-fixed-dim rounded-full animate-pulse"></div>
          <div className="absolute bottom-12 left-12 w-2 h-2 bg-primary-fixed-dim rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Text Content */}
        <h2 className="text-headline-md font-headline-md md:font-headline-lg md:text-headline-lg text-on-surface mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-body-md font-body-md md:text-body-lg md:font-body-lg text-on-surface-variant mb-8 max-w-[85%] mx-auto">
            {description}
          </p>
        )}

        {/* CTA Action Slot */}
        {action && (
          <div className="w-full flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
