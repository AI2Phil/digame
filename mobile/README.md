# Digame Mobile Application

A React Native mobile application for the Digame Digital Activity Intelligence platform, built with Expo.

## Features

- **Authentication**: Secure login and registration with JWT tokens
- **Dashboard**: Real-time productivity metrics and activity tracking
- **Analytics**: Detailed insights with interactive charts and anomaly detection
- **Profile Management**: User settings and account management
- **Onboarding**: Guided setup for new users
- **Cross-Platform**: Runs on iOS, Android, and Web

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **React Navigation**: Navigation library
- **React Native Chart Kit**: Data visualization
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client for API communication

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. **Clone the repository and navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   Update the `API_BASE_URL` in the service files to point to your backend:
   - `src/services/AuthService.js`
   - `src/services/ApiService.js`

## Development

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Run on specific platforms**:
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   ```

## Project Structure

```
mobile/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AnalyticsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── OnboardingScreen.js
│   └── services/         # API and authentication services
│       ├── AuthService.js
│       └── ApiService.js
└── README.md
```

## API Integration

The mobile app integrates with the Digame backend API using the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/onboarding` - Update onboarding status

### Analytics
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/productivity` - Productivity metrics
- `GET /analytics/activity-breakdown` - Activity breakdown

### Data Management
- `GET /anomalies/` - Anomaly detection results
- `GET /process-notes/` - Process notes
- `GET /tasks/` - User tasks
- `GET /behavior/patterns` - Behavioral patterns

## Features Overview

### Authentication Flow
- Secure JWT-based authentication
- Automatic token refresh
- Persistent login state
- Registration with validation

### Dashboard
- Real-time productivity metrics
- Activity tracking visualization
- Quick action buttons
- Refresh-to-update functionality

### Analytics
- Interactive charts and graphs
- Time range selection (7d, 30d, 90d)
- Anomaly detection alerts
- Behavioral insights

### Profile Management
- User information editing
- Settings configuration
- Account statistics
- Logout functionality

### Onboarding
- Multi-step guided setup
- Feature preference selection
- Progress tracking
- Smooth user experience

## Styling

The app uses a consistent design system with:
- **Primary Color**: #007AFF (iOS Blue)
- **Success Color**: #34C759 (Green)
- **Warning Color**: #FF9500 (Orange)
- **Error Color**: #FF3B30 (Red)
- **Background**: #f8f9fa (Light Gray)

## State Management

- Local state with React hooks
- AsyncStorage for persistence
- Context API for global state (if needed)

## Error Handling

- Network error handling
- User-friendly error messages
- Retry mechanisms
- Offline state management

## Security

- JWT token storage in AsyncStorage
- Automatic token validation
- Secure API communication
- Input validation and sanitization

## Building for Production

1. **Configure app.json** for your specific requirements
2. **Build for iOS**:
   ```bash
   expo build:ios
   ```
3. **Build for Android**:
   ```bash
   expo build:android
   ```

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Follow React Native best practices
2. Use consistent code formatting
3. Add proper error handling
4. Update documentation for new features

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **iOS simulator not starting**: Reset simulator
3. **Android build failures**: Check Android SDK configuration
4. **API connection issues**: Verify backend is running and accessible

### Debug Mode

Enable debug mode in development:
```bash
expo start --dev-client
```

## License

This project is part of the Digame platform and follows the same licensing terms.