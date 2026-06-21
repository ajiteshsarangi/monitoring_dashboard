/**
 * Resolves properties for a given status string dynamically.
 * Supports HEALTHY, DEGRADED, DOWN, CRITICAL, UNKNOWN, etc.
 * Handles future additions gracefully.
 */
export const getStatusConfig = (statusStr) => {
  if (!statusStr) {
    return {
      category: 'info',
      variant: 'info',
      color: 'var(--text-muted)',
      accentColor: 'var(--accent-blue)',
      glow: '0 0 6px var(--accent-blue)',
      label: 'UNKNOWN'
    };
  }

  const clean = statusStr.toUpperCase().trim();

  // Green / Success states
  if (['UP', 'ONLINE', 'HEALTHY', 'OK', 'ACTIVE', 'REACHABLE'].includes(clean)) {
    return {
      category: 'online',
      variant: 'success',
      color: 'var(--success)',
      accentColor: 'var(--success)',
      glow: '0 0 6px var(--success)',
      label: clean
    };
  }

  // Yellow / Warning states
  if (['DEGRADED', 'WARNING', 'UNHEALTHY', 'WARN'].includes(clean)) {
    return {
      category: 'warning',
      variant: 'warning',
      color: 'var(--warning)',
      accentColor: 'var(--warning)',
      glow: '0 0 6px var(--warning)',
      label: clean
    };
  }

  // Red / Danger / Critical states
  if (['DOWN', 'CRITICAL', 'ERROR', 'FAIL', 'FAILED', 'OFFLINE', 'UNREACHABLE'].includes(clean)) {
    return {
      category: 'critical',
      variant: 'danger',
      color: 'var(--danger)',
      accentColor: 'var(--danger)',
      glow: '0 0 6px var(--danger)',
      label: clean
    };
  }

  // Fallback / Unknown or custom future states (Blue/Gray neutral)
  return {
    category: 'info',
    variant: 'info',
    color: 'var(--text-muted)',
    accentColor: 'var(--accent-blue)',
    glow: '0 0 6px var(--accent-blue)',
    label: clean
  };
};
