
// import React from 'react'
// import { Toaster } from "react-hot-toast";
// import UserRoutes from './routes/entrepreneurRoutes'
// import InvestorRoutes from './routes/investorRoutes'
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import CommonRoutes from './routes/commonRoutes'

// function App() {
//   return (
//     <BrowserRouter>
//     <Routes>
//       <Route path="/*" element={<CommonRoutes/>}/>
//       <Route path="/entrepreneur/*" element={<UserRoutes/>}/>
//       <Route path="/investor/*" element={<InvestorRoutes/>}/>

//     </Routes>
//     </BrowserRouter>
//   )
// }

// export default App


import React from 'react';
import { Toaster } from "react-hot-toast";
import UserRoutes from './routes/entrepreneurRoutes'; // Renamed to UserRoutes for clarity
import InvestorRoutes from './routes/investorRoutes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommonRoutes from './routes/commonRoutes';
import DashboardRouter from './routes/dashboardRoutes'
import AdminDashboardRouter from './routes/adminDashboardRoutes';
import AdminRouter from './routes/adminRoutes'
import { ThemeProvider } from './components/theme-provider';
import CheckoutRouter from './routes/checkOutRoutes';
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

    <BrowserRouter>
      <Toaster />
      <Routes>
        
        
        <Route path="/entrepreneur/*" element={<UserRoutes />} />
        <Route path="/investor/*" element={<InvestorRoutes />} />
        <Route path="/mainpage/*" element={<DashboardRouter />} />
        <Route path="/*" element={<CommonRoutes />} />
        <Route path="/dashboard/*" element={<AdminDashboardRouter />} />
        <Route path="/admin/*" element={<AdminRouter/>} />
        <Route path="/checkout/*" element={<CheckoutRouter />} /> {/* Fixed typo */}      </Routes>
    </BrowserRouter>
    </ThemeProvider>

  );
}

export default App;