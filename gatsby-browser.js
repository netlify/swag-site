import React from 'react';
import { CartProvider } from './src/context/cart-context';
import { AccessProvider } from './src/context/access-context';

export const wrapRootElement = ({ element }) => (
  <AccessProvider>
    <CartProvider>{element}</CartProvider>
  </AccessProvider>
);
