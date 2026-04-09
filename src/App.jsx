import React, { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage      from './pages/LoginPage.jsx'
import HomePage       from './pages/HomePage.jsx'
import RawLotPage     from './pages/RawLotPage.jsx'
import SteamingPage   from './pages/SteamingPage.jsx'
import ShellingPage   from './pages/ShellingPage.jsx'
import DryingPage     from './pages/DryingPage.jsx'
import PeelingPage    from './pages/PeelingPage.jsx'
import GradingPage    from './pages/GradingPage.jsx'
import PackagingPage  from './pages/PackagingPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [role, setRole] = useState(null)

  return (
    <AppContext.Provider value={{ role, setRole }}>
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-md min-h-screen flex flex-col bg-white shadow-sm relative">
          <Routes>
            <Route path="/"            element={<LoginPage />} />
            <Route path="/home"        element={role ? <HomePage />       : <Navigate to="/" />} />
            <Route path="/raw-lot"     element={role ? <RawLotPage />     : <Navigate to="/" />} />
            <Route path="/steaming"    element={role ? <SteamingPage />   : <Navigate to="/" />} />
            <Route path="/shelling"    element={role ? <ShellingPage />   : <Navigate to="/" />} />
            <Route path="/drying"      element={role ? <DryingPage />     : <Navigate to="/" />} />
            <Route path="/peeling"     element={role ? <PeelingPage />    : <Navigate to="/" />} />
            <Route path="/grading"     element={role ? <GradingPage />    : <Navigate to="/" />} />
            <Route path="/packaging"   element={role ? <PackagingPage />  : <Navigate to="/" />} />
            <Route path="/dashboard"   element={role ? <DashboardPage />  : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </AppContext.Provider>
  )
}
