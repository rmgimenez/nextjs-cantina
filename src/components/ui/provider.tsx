'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

export const Provider = ({ children }: { children: React.ReactNode }) => {
  // Use the library default system to ensure the provider receives a valid system
  // object with the expected `_config` and `_global` values. We'll iterate on
  // custom theming later if desired.
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};

export default Provider;
