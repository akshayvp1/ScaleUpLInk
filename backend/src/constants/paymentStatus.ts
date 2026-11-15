// src/constants/paymentStatus.ts

export const paymentStatus = {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    CANCELLED: "cancelled",
    REFUNDED:"refunded"
  } as const;
  
  export type PaymentStatus = typeof paymentStatus[keyof typeof paymentStatus];
  