'use client';

import React, { createContext, useContext } from 'react';

const TelemetryContext = createContext(null);

export const TelemetryProvider = ({ value, children }) => {
  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
