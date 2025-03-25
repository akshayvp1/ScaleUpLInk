import Navbar from "../../components/navbar/navbar";
import SingIn from '../../components/basics/singIn'
// import Role from '../../components/basics/role'
// import InvestorRegister from '../../components/basics/investorRegister'

import React from 'react'

function auth() {
  return (
    <>
        <Navbar/>
        <SingIn/>
        {/* <Role/> */}
        {/* <InvestorRegister/> */}
    </>
  )
}

export default auth