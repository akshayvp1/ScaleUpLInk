// // backend/src/scheduler.ts
// import { container } from "tsyringe";
// import PaymentService from "./services/payment/paymentService";
// import cron from "node-cron";

// export const startScheduler = () => {
//   const paymentService = container.resolve(PaymentService);

//   // Run every 5 minutes
//   cron.schedule("*/5 * * * *", async () => {
//     try {
//       console.log("Running handleStateTransactions...");
//       await paymentService.handleStateTransactions();
//       console.log("handleStateTransactions completed.");
//     } catch (error) {
//       console.error("Error in handleStateTransactions scheduler:", error);
//     }
//   });
// };