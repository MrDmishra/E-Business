# E-Business Mobile App

React Native mobile application for the E-Business e-commerce platform.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

## Installation

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

## Configuration

Update the API base URL in `src/services/api.js`:

- **Android Emulator**: `http://10.0.2.2:8080/api`
- **iOS Simulator**: `http://localhost:8080/api`
- **Physical Device**: `http://YOUR_LOCAL_IP:8080/api` (replace YOUR_LOCAL_IP with your computer's IP address)

## Running the App

1. Start the backend server on port 8080

2. Start Expo development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run android  # Android emulator/device
npm run ios      # iOS simulator (Mac only)
npm run web      # Browser
```

4. Or scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app

## Features

- ✅ Product browsing with category filters
- ✅ Product detail view with image gallery
- ✅ Shopping cart management
- ✅ User authentication (login/register)
- ✅ Order placement with address selection
- ✅ Order history tracking
- ✅ User profile management
- ✅ Bottom tab navigation
- ✅ AsyncStorage for cart and user persistence

## Project Structure

```
mobile-app/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
└── src/
    ├── context/                # React Context (Auth, Cart)
    ├── screens/                # App screens
    │   ├── HomeScreen.js       # Product listing
    │   ├── ProductScreen.js    # Product details
    │   ├── CartScreen.js       # Shopping cart
    │   ├── CheckoutScreen.js   # Order checkout
    │   ├── OrdersScreen.js     # Order history
    │   ├── ProfileScreen.js    # User profile
    │   ├── LoginScreen.js      # User login
    │   └── RegisterScreen.js   # User registration
    ├── components/             # Reusable components
    └── services/
        └── api.js              # API service layer
```

## API Endpoints Used

- `GET /api/items` - Fetch all items
- `GET /api/items/:id` - Fetch single item
- `GET /api/categories` - Fetch categories
- `GET /api/consumers/:id` - Fetch consumer details
- `POST /api/consumers` - Create consumer
- `PUT /api/consumers/:id` - Update consumer
- `GET /api/orders/consumer/:id` - Fetch consumer orders
- `POST /api/orders` - Create order
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Troubleshooting

1. **Cannot connect to backend**:
   - Check API_BASE_URL in `src/services/api.js`
   - Ensure backend is running on port 8080
   - For physical devices, use your computer's local IP address

2. **Dependencies issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Clear Expo cache**:
   ```bash
   expo start -c
   ```

## Tech Stack

- React Native 0.74.5
- Expo ~51.0.28
- React Navigation 6.x
- AsyncStorage for local storage
- Axios for API calls
