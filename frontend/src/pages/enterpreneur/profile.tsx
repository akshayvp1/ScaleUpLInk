import React from 'react'
// import Navbar from '../../components/navbar/navbar'
// import AgeCard from '../../components/entrepreneur/ageCard'
import ProfileComponent from '../../components/basics/profile'
import { ModeToggle } from '../../components/mode-toggle'
function Profile() {
  return (
    <>
    <ModeToggle/>
    <ProfileComponent/>
    </>
  )
}

export default Profile