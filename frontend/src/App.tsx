
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

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        
        
        <Route path="/entrepreneur/*" element={<UserRoutes />} />
        <Route path="/investor/*" element={<InvestorRoutes />} />
        <Route path="/mainpage/*" element={<DashboardRouter />} />
        <Route path="/*" element={<CommonRoutes />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;