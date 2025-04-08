
import {  Routes, Route } from 'react-router-dom';

import EventCreation from '../pages/enterpreneur/EventCreation'

function App() {
  return (
    
    <Routes>
      
     
      <Route path='/event-creation' element={<EventCreation/>} />
      

    </Routes>
    
  )
}

export default App