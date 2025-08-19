'use client';

import React from 'react';

// Minimal provider component kept for parity with previous implementation.
// Bootstrap doesn't require a React provider; this simply passes children through
// and can be a place to add global context/providers in the future.
export const Provider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Provider;
