import React, { createContext, useContext } from 'react'

const AlertContext = createContext(null)

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}

export const AlertProvider = ({ children, showAlert }) => {
  const alertMethods = {
    success: (title, message, options) => showAlert('success', title, message, options),
    error: (title, message, options) => showAlert('error', title, message, options),
    warning: (title, message, options) => showAlert('warning', title, message, options),
    info: (title, message, options) => showAlert('info', title, message, options)
  }
  
  return (
    <AlertContext.Provider value={alertMethods}>
      {children}
    </AlertContext.Provider>
  )
}
