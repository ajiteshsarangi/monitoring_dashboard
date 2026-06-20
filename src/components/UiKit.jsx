import React from 'react';
import { CloseIcon } from './Icons';

/**
 * 1. Card Component
 */
export const Card = ({ title, subtitle, icon, actions, children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || icon || actions) && (
        <div className="card-header">
          <div className="card-title">
            {icon && <span style={{ display: 'inline-flex', color: 'var(--accent-blue)' }}>{icon}</span>}
            <div>
              {title && <div>{title}</div>}
              {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

/**
 * 2. Button Component
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const btnClass = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`;
  return (
    <button 
      type={type} 
      className={btnClass} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * 3. Badge Component
 */
export const Badge = ({ children, variant = 'info', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

/**
 * 4. Modal Component
 */
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 5. Toggle Switch Component
 */
export const Toggle = ({ label, checked, onChange, id }) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="customizer-option">
      <span>{label}</span>
      <label className="toggle-switch" htmlFor={toggleId}>
        <input 
          type="checkbox" 
          id={toggleId}
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

/**
 * 6. Stat Card Widget component
 */
export const StatCard = ({ label, value, icon, trend, trendValue, trendDirection = 'up', className = '' }) => {
  const isUp = trendDirection === 'up';
  const isDown = trendDirection === 'down';
  const isNeutral = trendDirection === 'neutral';

  let trendClass = 'trend-indicator trend-neutral';
  if (isUp) trendClass = 'trend-indicator trend-up';
  if (isDown) trendClass = 'trend-indicator trend-down';

  return (
    <div className={`card stat-card ${className}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && (
          <div 
            className="stat-icon" 
            style={{ 
              backgroundColor: isUp ? 'rgba(16, 185, 129, 0.1)' : isDown ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              color: isUp ? 'var(--success)' : isDown ? 'var(--danger)' : 'var(--accent-blue)'
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className="stat-footer">
            <span className={trendClass}>
              {trendValue}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
