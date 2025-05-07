# SkillSwap

![SkillSwap Logo](client/public/logo.svg)

## About SkillSwap

SkillSwap is a comprehensive freelance marketplace platform connecting skilled freelancers with clients seeking their services. Built using the MERN stack (MongoDB, Express, React, Node.js), it provides a secure, scalable platform to address the needs of Pakistan's growing freelance industry.

## Key Features

### For Clients

- **Role-Based Authentication**: Secure signup and login with JWT and bcrypt hashing
- **Freelancer Search System**: Find freelancers based on skills, ratings, and availability
- **Project Management**: Post, edit, and manage projects with detailed specifications
- **Real-Time Bidding**: Receive and evaluate bids from qualified freelancers
- **Messaging System**: Communicate with freelancers in real-time
- **Review & Rating**: Rate and review freelancers after project completion
- **Analytics Dashboard**: Track project performance and spending

### For Freelancers

- **Profile Management**: Create and maintain a professional profile with portfolio
- **Bid Management**: Submit and track bids on available projects
- **Project Management Tools**: Track project progress and manage multiple projects
- **Project Timeline**: Set milestones and track progress with deadlines
- **Secure Payments**: Receive payments through a secure payment system
- **Verification System**: Get verified to increase trust and visibility

### For Administrators

- **Freelancer Verification**: Approve/reject verification requests with document review
- **Platform Analytics**: Monitor platform growth, transactions, and user statistics
- **Notification System**: Manage and send email notifications to users

## Tech Stack

### Frontend
- **React**: UI library (built with Vite)
- **Tailwind CSS**: Styling and responsive design
- **Socket.io-client**: Real-time communication
- **Chart.js**: Data visualization for analytics
- **Axios**: API communication

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **Socket.io**: Real-time bidding and messaging
- **Nodemailer**: Email notifications

### Security Features
- Password hashing with bcrypt
- JWT for secure authentication
- Document and message metadata hashing
- Role-based access control
- Input validation and sanitization

## Project Structure

```
skillswap/
├── client/                   # Frontend React application
├── server/                   # Backend Node.js/Express API
│   ├── controllers/          # API controllers
│   ├── middleware/           # Express middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── uploads/              # Uploaded files
│   └── server.js             # Entry point
└── package.json              # Root package.json
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup
1. Navigate to the server directory
   ```
   cd server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=SkillSwap Team
   ```

4. Start the server
   ```
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory
   ```
   cd client
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the client directory with the following:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Documentation

The SkillSwap API follows RESTful design principles and is organized into logical modules:

### Authentication APIs
- `POST /api/auth/signup` - Register a new user (client or freelancer)
- `POST /api/auth/login` - Authenticate a user and receive JWT token
- `POST /api/auth/verify` - Verify email/phone
- `POST /api/auth/reset-password` - Reset user password

### Project APIs
- `GET /api/projects` - Get all projects (with filters)
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/bids` - Get bids for a project
- `POST /api/projects/:id/bids` - Submit a bid

### Freelancer APIs
- `GET /api/freelancers` - Get freelancers (with filters)
- `GET /api/freelancers/:id` - Get freelancer profile
- `PUT /api/freelancers/:id` - Update freelancer profile
- `POST /api/freelancers/verify` - Submit verification documents

### Notification APIs
- `POST /api/notifications/admin/email` - Send email notifications
- `GET /api/notifications/admin/templates` - Get notification templates
- `PUT /api/notifications/admin/templates` - Update notification templates

### Message APIs
- `GET /api/messages` - Get all conversations
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send a message

## Modular Architecture

SkillSwap is built with a modular architecture for better scalability and maintainability:

1. **API Modules**: Separate routes and controllers for different features
2. **Component-Based Frontend**: Reusable React components organized by function
3. **Service Layer**: Abstracted API calls for cleaner component code
4. **Middleware**: Reusable authentication and validation middleware

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)