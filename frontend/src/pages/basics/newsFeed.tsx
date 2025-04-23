import React from 'react'
import NewsFeed from '../../components/basics/newsFeed'
import { ModeToggle } from '../../components/mode-toggle'

function newsFeed() {
  return (
    <>
   <ModeToggle/>
   <NewsFeed/>
    </>
  )
}

export default newsFeed