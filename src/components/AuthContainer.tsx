import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true)

  const switchToRegister = () => setIsLogin(false)
  const switchToLogin = () => setIsLogin(true)

  return (
    <>
      {isLogin ? (
        <Login onSwitchToRegister={switchToRegister} />
      ) : (
        <Register onSwitchToLogin={switchToLogin} />
      )}
    </>
  )
} 