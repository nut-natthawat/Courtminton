import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/home'
import Register from './components/register'
import Login from './components/login'
import Profile from './components/profile'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/profile" element={<Profile token={token} />} />
      </Routes>
    </Router>
  )
}

export default App
