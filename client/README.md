# SkillSwap - Client

## Overview
SkillSwap's frontend is built with React and provides a responsive, user-friendly interface for connecting freelancers with clients. This client-side application implements role-based access control, real-time communication features, and dynamic dashboards for an optimal user experience.

## Features

### Role-Based Access
- **Client Dashboard**: Project posting, bid management, and freelancer search
- **Freelancer Dashboard**: Portfolio management, project bidding, and earnings tracking
- **Admin Dashboard**: Platform analytics, user verification, and system administration

### Key Modules

#### User Authentication
- Secure login and registration with JWT authentication
- Role-based access control
- Password reset functionality

#### Client Features
- Project posting with detailed requirements
- Freelancer search with advanced filtering options
- Bid management and selection
- In-app messaging with freelancers
- Review and rating system

#### Freelancer Features
- Professional profile management
- Portfolio showcase with images and descriptions
- Project bidding system
- Earnings tracking and milestone management
- Verification process for enhanced trust

#### Admin Features
- User management and verification
- Platform analytics and reporting
- Notification system management
- Content monitoring tools

### UI Components
- Modern, responsive design using Tailwind CSS
- Interactive dashboards with real-time updates
- Form validation with error handling
- Dynamic filtering and sorting capabilities

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Communication**: Axios
- **Real-time Communication**: Socket.io

## Project Structure
```
src/
├── App.jsx               # Main application component
├── main.jsx             # Entry point
├── config.js            # Configuration constants
├── assets/              # Static assets
├── components/          # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── client/          # Client-specific components
│   ├── common/          # Shared components
│   ├── freelancer/      # Freelancer-specific components
│   ├── public/          # Public-facing components
│   └── reviews/         # Review-related components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── pages/               # Page components for routing
│   ├── admin/           # Admin pages
│   ├── auth/            # Authentication pages
│   ├── client/          # Client pages
│   ├── freelancer/      # Freelancer pages
│   ├── messages/        # Messaging pages
│   └── reviews/         # Review pages
└── utils/               # Utility functions and services
    ├── adminDashboardService.js
    ├── adminService.js
    ├── analyticsService.js
    ├── authService.js
    ├── bidService.js
    ├── freelancerService.js
    ├── messageService.js
    ├── projectService.js
    ├── reviewService.js
    └── socketService.js
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
   ```
   git clone https://github.com/your-username/skillswap.git
   cd skillswap/client
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   Create a `.env` file in the client directory with the following:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Building for Production
```
npm run build
# or
yarn build
```

## Security Features
- JWT token validation
- Protected routes by user role
- Form input validation and sanitization
- Secure API communication

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request