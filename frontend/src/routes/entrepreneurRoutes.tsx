import React from 'react'
import MainPage from '../pages/mainPage/mainPage'
import SingUp from '../pages/auth/signUp'
import SignIn from '../pages/auth/signIn'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Otp from '../pages/auth/otp'
import Profession from '../pages/enterpreneur/profession'
import AgeCard from '../pages/enterpreneur/ageCard'
import Role from '../pages/auth/role'
import InvestorRegister from '../pages/auth/investorRegister';
import ChooseInterest from '../pages/auth/chooseInterest'
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<MainPage/>} />
      <Route path='/signin' element={<SignIn/>} />
      <Route path='/signup' element={<SingUp/>} />
      <Route path='/otp' element={<Otp/>} />
      <Route path='/profession' element={<Profession/>} />
      <Route path='/agecard' element={<AgeCard/>} />
      <Route path='/role' element={<Role/>} />
      <Route path='/investor-register' element={<InvestorRegister/>} />
      <Route path='/choose-interest' element={<ChooseInterest/>} />


    </Routes>
    </BrowserRouter>
  )
}

export default App