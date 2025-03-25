
import React from 'react'
import { Toaster } from "react-hot-toast";
import UserRoutes from './routes/entrepreneurRoutes'
function App() {
  return (
    <div>
       <Toaster />
      <UserRoutes/>
    </div>
  )
}

export default App


