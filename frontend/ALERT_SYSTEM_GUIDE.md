# Alert System Usage Guide

## Overview
The alert system provides both **temporary toast notifications** and **persistent notifications** in the notification center.

## Alert Types

1. **Success** ✅ - Green gradient, for successful operations
2. **Error** ❌ - Red gradient, for errors and failures
3. **Warning** ⚠️ - Orange gradient, for warnings
4. **Info** ℹ️ - Blue gradient, for informational messages

## Using Alerts in Components

### Method 1: Using the useAlert Hook (Recommended)

```jsx
import React from 'react'
import { useAlert } from '../context/AlertContext'

export default function MyComponent() {
  const alert = useAlert()
  
  const handleSave = async () => {
    try {
      // Your save logic
      await saveData()
      
      // Show success alert
      alert.success('Saved Successfully', 'Your changes have been saved')
      
    } catch (error) {
      // Show error alert
      alert.error('Save Failed', error.message)
    }
  }
  
  const handleWarning = () => {
    alert.warning('Low Stock', 'Only 3 items remaining')
  }
  
  const handleInfo = () => {
    alert.info('New Feature', 'Check out the new dashboard!')
  }
  
  return (
    <div>
      <button onClick={handleSave}>Save</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  )
}
```

### Method 2: Direct showAlert Function

If you need more control, you can pass `showAlert` as a prop from App.jsx:

```jsx
// In parent component
<MyComponent showAlert={showAlert} />

// In MyComponent
export default function MyComponent({ showAlert }) {
  const handleAction = () => {
    showAlert('success', 'Done!', 'Action completed successfully', {
      duration: 3000,      // Auto-dismiss after 3 seconds
      persistent: false    // Don't add to notification center
    })
  }
}
```

## Alert Options

```javascript
showAlert(type, title, message, options)

// Parameters:
// - type: 'success' | 'error' | 'warning' | 'info'
// - title: string (required) - Main heading
// - message: string (optional) - Detailed message
// - options: object (optional)
//   - duration: number (default: 5000ms) - How long to show toast
//   - persistent: boolean (default: true) - Add to notification center

// Examples:
alert.success('Saved!', 'Product updated successfully')

alert.error('Failed', 'Network error occurred', { duration: 7000 })

alert.warning('Warning', 'Proceeding will delete data')

alert.info('Info', 'New update available', { persistent: false })
```

## Real-World Examples

### 1. Form Submission
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      alert.success('Product Added', 'New product created successfully')
      resetForm()
    } else {
      throw new Error('Failed to create product')
    }
  } catch (error) {
    alert.error('Error', 'Unable to create product. Please try again.')
  }
}
```

### 2. Delete Confirmation
```jsx
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return
  
  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    alert.success('Deleted', 'Product removed successfully')
    fetchProducts()
  } catch (error) {
    alert.error('Delete Failed', 'Unable to delete product')
  }
}
```

### 3. Validation Warning
```jsx
const validateForm = () => {
  if (!formData.name) {
    alert.warning('Missing Field', 'Please enter a product name')
    return false
  }
  if (formData.price < 0) {
    alert.warning('Invalid Price', 'Price cannot be negative')
    return false
  }
  return true
}
```

### 4. Background Updates
```jsx
useEffect(() => {
  const interval = setInterval(async () => {
    const newOrders = await checkForNewOrders()
    if (newOrders.length > 0) {
      alert.info(
        'New Orders', 
        `${newOrders.length} new order(s) received`,
        { duration: 3000 }
      )
    }
  }, 60000) // Check every minute
  
  return () => clearInterval(interval)
}, [])
```

### 5. Stock Alerts
```jsx
const checkStock = (item) => {
  if (item.stock === 0) {
    alert.error('Out of Stock', `${item.name} is out of stock`)
  } else if (item.stock < 10) {
    alert.warning('Low Stock', `Only ${item.stock} units of ${item.name} left`)
  }
}
```

## Features

✅ Auto-dismiss after specified duration (default 5 seconds)
✅ Click to dismiss manually
✅ Progress bar showing time remaining
✅ Animated slide-in from right
✅ Automatically added to notification center
✅ Different colors for different alert types
✅ Stacks multiple alerts (newest on top)
✅ Option for temporary-only alerts (persistent: false)

## Best Practices

1. **Use appropriate types**: Match alert type to the situation
2. **Keep titles short**: 2-4 words max
3. **Be specific in messages**: Tell users exactly what happened
4. **Set reasonable durations**: 3s for success, 5s for errors, 7s for important warnings
5. **Don't overuse**: Too many alerts can be annoying
6. **Use persistent: false** for non-critical info that doesn't need to be saved

## Updating Existing Components

To add alerts to existing components like ProductManagement, OrderManagement, etc.:

```jsx
// Old way (browser alerts)
alert('Product saved successfully!')

// New way (system alerts)
import { useAlert } from '../context/AlertContext'

const alert = useAlert()
alert.success('Saved', 'Product saved successfully!')
```

This provides a much better user experience with styled notifications!
