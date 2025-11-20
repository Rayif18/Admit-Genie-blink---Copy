# Admit Genie Backend

Complete Node.js backend API for the AI-powered admission assistant chatbot system.

## 🚀 Features

- **RESTful API** with comprehensive endpoints for all frontend functionality
- **JWT Authentication** for users and admins with role-based access control
- **College Prediction Algorithm** using historical cutoff data
- **Database Integration** with MySQL and Sequelize ORM
- **AI Chatbot** integrated with free unlimited LLM (CometAPI)
- **Real-time Data** synchronization with JoSAA cutoff information
- **Admin Dashboard** for managing colleges, courses, and analytics
- **Comprehensive Error Handling** with detailed logging
- **Input Validation** with express-validator
- **Security Features** including CORS, helmet, and rate limiting

## 📋 Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+
- Free CometAPI account (for LLM functionality)

## 🔧 Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=admit_genie

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d

   # Free LLM API (CometAPI)
   COMET_API_KEY=your_comet_api_key
   COMET_API_BASE_URL=https://api.cometapi.com/v1
   COMET_MODEL=gpt-3.5-turbo

   # Server Configuration
   PORT=5000
   FRONTEND_URL=http://localhost:3000

   # Admin Registration Key
   ADMIN_REGISTRATION_KEY=your_secure_admin_registration_key
   ```

3. **Get CometAPI Key**
   - Sign up at: https://api.cometapi.com/
   - Get your free API key from the dashboard
   - Add it to the `.env` file as `COMET_API_KEY`

## 🗄️ Database Setup

1. **Create MySQL database**
   ```sql
   CREATE DATABASE admit_genie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Initialize database schema and seed data**
   ```bash
   # Initialize database tables
   npm run init-db

   # Seed with sample data (recommended)
   npm run seed-all

   # Or run individual seeding scripts
   npm run seed-colleges
   npm run seed-cutoffs
   npm run seed-exams
   ```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /admin/register` - Admin registration (requires registration key)
- `POST /admin/login` - Admin login
- `POST /refresh` - Token refresh
- `POST /logout` - Logout

### User Routes (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /rank` - Save CET rank
- `GET /predictions` - Get saved predictions

### College Routes (`/api/colleges`)
- `GET /` - List colleges (with pagination and filters)
- `GET /:id` - Get college details
- `GET /search` - Search colleges
- `GET /:id/courses` - Get courses by college

### Course Routes (`/api/courses`)
- `GET /` - List courses
- `GET /:id` - Get course details
- `GET /search` - Search courses
- `GET /college/:collegeId` - Get courses by college

### Prediction Routes (`/api/predict`)
- `POST /colleges` - Get college predictions based on rank
- `POST /analysis` - Detailed cutoff analysis
- `POST /compare` - Compare multiple colleges
- `GET /trends/:collegeId` - Get cutoff trends

### Chatbot Routes (`/api/chatbot`)
- `POST /chat` - Send message and get AI response
- `GET /history` - Get chat history
- `GET /analytics/:userId` - Get chat analytics
- `POST /feedback` - Submit chat feedback

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Get dashboard statistics
- `GET|POST|PUT|DELETE /colleges` - Manage colleges
- `GET|POST|PUT|DELETE /courses` - Manage courses
- `GET|POST|PUT|DELETE /cutoffs` - Manage cutoff data
- `GET /analytics/users` - User analytics
- `GET /analytics/chats` - Chat analytics

## 🔍 Health Check

- `GET /health` - Server health status

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:api
npm run test:integration
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **admins** - Admin accounts
- **colleges** - College information
- **courses** - Course details with college association
- **cutoff_data** - Historical cutoff ranks by category and year
- **exam_schedules** - Engineering entrance exam dates
- **chat_history** - Chat conversation logs

### Relationships
- Colleges ↔ Courses (One-to-Many)
- Colleges/Courses ↔ Cutoff Data (Many-to-One)
- Users ↔ Chat History (One-to-Many)

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | 127.0.0.1 |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | admit_genie |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration | 7d |
| `COMET_API_KEY` | CometAPI key | - |
| `COMET_MODEL` | LLM model | gpt-3.5-turbo |
| `PORT` | Server port | 5000 |
| `FRONTEND_URL` | Frontend URL | http://localhost:3000 |
| `ADMIN_REGISTRATION_KEY` | Admin registration key | - |

## 🛡️ Security Features

- **JWT Authentication** with token expiration
- **Password Hashing** with bcryptjs
- **Input Validation** with express-validator
- **CORS Configuration** for frontend access
- **Helmet Middleware** for security headers
- **Rate Limiting** for API protection
- **SQL Injection Prevention** via Sequelize ORM
- **XSS Protection** with input sanitization

## 📈 Performance Features

- **Database Indexing** for query optimization
- **Response Caching** for frequently accessed data
- **Pagination** for large data sets
- **Connection Pooling** for database efficiency
- **Compression Middleware** for faster responses

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start server in development mode with nodemon
npm start           # Start server in production mode

# Database Management
npm run init-db     # Initialize database schema
npm run seed-all    # Seed all data at once
npm run seed-colleges    # Seed colleges and courses
npm run seed-cutoffs     # Seed cutoff data
npm run seed-exams       # Seed exam schedules
npm run download-data    # Download sample data

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:cover  # Run tests with coverage

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

## 🌍 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your environment
2. Configure production database credentials
3. Set secure JWT secrets
4. Configure CORS for your frontend domain

### PM2 Setup (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "admit-genie-backend"

# View logs
pm2 logs

# Monitor performance
pm2 monit
```

### Docker Setup
```bash
# Build Docker image
docker build -t admit-genie-backend .

# Run container
docker run -p 5000:5000 --env-file .env admit-genie-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid input provided",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

## 🆘 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE admit_genie;`

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Clear browser cookies/localStorage

### LLM API Issues
- Verify COMET_API_KEY is valid
- Check internet connectivity
- Fallback responses work without API key

### Performance Issues
- Check database indexes
- Monitor server logs
- Use pagination for large datasets

## 📄 License

MIT License - see LICENSE file for details.

## 🤖 API Integration Notes

### CometAPI Integration
- **Free tier**: 500+ AI models available
- **Compatible**: Works with OpenAI SDK format
- **Fallback**: Rule-based responses when API unavailable
- **Cost optimization**: Uses smaller models for simple queries

### Data Sources
- **JoSAA Official**: https://josaa.nic.in/
- **GitHub Repositories**: Historical cutoff data
- **Annual Updates**: Automated data refresh scripts

For more information, visit the project documentation or open an issue.