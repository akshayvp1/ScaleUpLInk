
import { Routes, Route } from 'react-router-dom';

import InvestorRegister from '../pages/auth/investorRegister';
function App() {
  return (
    
    <Routes>
      
      <Route path='/investor-register' element={<InvestorRegister/>} />


    </Routes>
    
  )
}

export default App