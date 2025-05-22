# CitizenSys Backend API

## Overview
Backend API service for the CitizenSys Complaint Management System, built with Express.js and SQLite.

## Tech Stack
- Node.js
- Express.js
- SQLite (with Sequelize ORM)
- WebSocket for real-time updates
- JWT for authentication
- Swagger for API documentation

## Project Structure
```
server/
├── src/
│   ├── config/      # Configuration files
│   ├── routes/      # API routes
│   ├── models/      # Database models
│   └── controllers/ # Route controllers
├── uploads/         # File uploads directory
├── migrations/      # Database migrations
├── config/         # Sequelize config
└── database.sqlite  # SQLite database
```

## Local Development

1. **Installation**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Database Setup**
   The SQLite database will be created automatically when you start the server.
   ```bash
   # Run migrations if needed
   npx sequelize-cli db:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### Complaints
- GET `/api/complaints` - List complaints
- POST `/api/complaints` - Create complaint
- GET `/api/complaints/:id` - Get complaint details
- PUT `/api/complaints/:id` - Update complaint
- DELETE `/api/complaints/:id` - Delete complaint

### Users
- GET `/api/users` - List users
- POST `/api/users` - Create user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Agencies
- GET `/api/agencies` - List agencies
- POST `/api/agencies` - Create agency
- PUT `/api/agencies/:id` - Update agency
- DELETE `/api/agencies/:id` - Delete agency

### Analytics
- GET `/api/analytics/complaints` - Complaints statistics
- GET `/api/analytics/users` - User statistics
- GET `/api/analytics/agencies` - Agency statistics

## Deployment to Render.com

1. **Prerequisites**
   - Render.com account
   - Git repository with your code

2. **Deployment Steps**

   a. **Manual Deployment**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository
   - Use these settings:
     ```
     Name: citizensys-api
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     ```

   b. **Environment Variables**
   Set these in Render Dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   PORT=8080
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

   c. **Database Configuration**
   - Render provides a persistent disk at `/opt/render/project/src/data`
   - Update database path in production to use this persistent storage

3. **Post-Deployment**
   - Test all API endpoints
   - Verify WebSocket connections
   - Check file upload functionality
   - Monitor error logs

## API Documentation
- Available at `/api-docs` when server is running
- Swagger UI interface for testing endpoints
- Authentication token usage examples
- Request/Response schemas

## Security Features
- JWT-based authentication
- CORS protection
- File upload restrictions
- Input validation
- Rate limiting (in production)

## Error Handling
Standard error response format:
```json
{
  "error": "Error message",
  "details": "Additional details if any"
}
```

## License
ISC License 