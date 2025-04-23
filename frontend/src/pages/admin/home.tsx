import React from 'react'
import TotalCard from '../../components/admin/dashboard/totalCard'
import RevenueGraph from '../../components/admin/dashboard/reveniewGraph'
import TopEventUsers from '../../components/admin/dashboard/topUsers'
import { ModeToggle } from '../../components/mode-toggle'

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-8 pt-6 relative">
      
      {/* Mode Toggle in top-right corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ModeToggle />
      </div>

      <TotalCard />

      <div className="flex flex-col lg:flex-row gap-6 pt-10">
        <RevenueGraph />
        <TopEventUsers />
      </div>
    </div>
  )
}

export default Home
