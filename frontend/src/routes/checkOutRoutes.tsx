// src/routes/checkOutRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Checkout from '../pages/enterpreneur/checkOutPage'; // Adjust path based on your project structure

function CheckoutRouter() {
  return (
    <Routes>
      <Route path="checkout" element={<Checkout />} />
      {/* Add other checkout-related routes here if needed */}
    </Routes>
  );
}

export default CheckoutRouter;