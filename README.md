# Heart Rate Monitor - Real-time Application

A professional real-time heart rate monitoring application built with Node.js, Express, MongoDB, and Vanilla JavaScript. Features live data streaming, interactive charts, and comprehensive statistics.

## 🚀 Features

- **Real-time Heart Rate Monitoring** - Live data streaming from WebSocket server
- **Interactive Charts** - Professional amCharts 5 visualizations with modern styling
- **Live Statistics** - Real-time Min, Max, Average, and Count calculations
- **Data Persistence** - MongoDB storage with automatic indexing, however, we have disabled it for now to enable you to run the project locally
- **Error Recovery** - Automatic reconnection and error handling
- **Historical Data** - API endpoints for accessing past readings

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [WebSocket Integration](#websocket-integration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before running this application, make sure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **MongoDB** - Either local installation or MongoDB Atlas account

### MongoDB Setup Options

#### MongoDB Atlas (It has been disabled for now, since it requires setup and credentials to save data)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Whitelist your IP address in Network Access
6. We have temporarily disabled mongodb in our code, so we can allow you to run it locally. (To run the project locally, you can skip the database setup steps)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB connection (if local)
mongosh --eval "db.runCommand('ismaster')"
```

## 📦 Installation

### 1. Clone or Create Project Directory
```bash
# Create new project directory
mkdir heart-rate-monitor
cd heart-rate-monitor

# Or clone from repository
git clone <your-repository-url>
cd heart-rate-monitor
```

### 2. Initialize npm and Install Dependencies
```bash
# Initialize package.json
npm init -y

# Install production dependencies
npm install

# Install development dependencies
npm install -D nodemon

# Verify installation
npm list --depth=0
```

### 3. Copy Application Files
Copy all the provided code files into their respective directories as shown in the project structure.

## ⚙️ Configuration

### 1. Required Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.net/` |
| `DATABASE_NAME` | MongoDB database name | Yes | `heart_rate_monitor` |
| `PORT` | Server port number | No | `3001` |
| `SESSION_SECRET` | Session encryption key | Yes | `your-secret-key` |
| `NODE_ENV` | Environment mode | No | `development` or `production` |

### 2. MongoDB Atlas Configuration
If using MongoDB Atlas:

1. **Replace connection string in `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
   ```

2. **Update IP whitelist:**
   - Go to Network Access in MongoDB Atlas
   - Add your current IP or `0.0.0.0/0` for all IPs (development only)

3. **Create database user:**
   - Go to Database Access
   - Create user with `readWrite` permissions

## 🏃‍♂️ Running the Application

### Development Mode
```bash

# Run it manually
node server.js

# Or start with automatic restart on file changes
npm run dev
```

### Production Mode
```bash
# Build and start
npm start

# Or manually
node server.js
```

### Verify Application is Running
1. **Check console output:**
   ```
   🚀 Heart Rate Monitor Server running on port 21802
   🌐 Open http://localhost:21802 to view the application
   ✅ Database initialized successfully
   🔌 Connecting to heart rate server: ws://...
   ✅ Connected to heart rate WebSocket server
   ```

2. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:21802/health

   # Main application
   curl http://localhost:21802/
   ```

3. **Open in browser:**
   Navigate to `http://localhost:21802`

## 📁 Project Structure

```
heart-rate-monitor/
├── 📄 package.json              # Project dependencies and scripts
├── 🚀 server.js                 # Main application server
├── 🔐 .env                      # Environment variables (create this)
├── 📋 .gitignore                # Git ignore file
├── 📖 README.md                 # This file
│
├── 📁 config/
│   ├── app_config.js            # Application configuration
│   └── database_config.js       # Database configuration
│
├── 📁 controllers/
│   ├── database_controller.js   # Database operations
│   └── websocket_controller.js  # WebSocket management
│
├── 📁 routes/
│   ├── main_routes.js           # Main application routes
│   └── api_routes.js            # API endpoints
│
├── 📁 services/
│   ├── heart_rate_service.js    # Heart rate data processing
│   └── websocket_service.js     # WebSocket service layer
│
├── 📁 middleware/
│   ├── auth_middleware.js       # Authentication middleware
│   └── cors_middleware.js       # CORS configuration
│
├── 📁 logs/
│   └── access.log               # Application logs (auto-generated)
│
├── 📁 public/                   # Static files served to browser
│   ├── 📁 css/
│   │   ├── main.css             # Main styles
│   ├── 📁 js/
│   │   ├── main.js              # Main application logic
│   │   ├── websocket-client.js  # WebSocket client
│   │   ├── chart-manager.js     # Chart management
│   │   ├── stats-manager.js     # Statistics calculation
│   │   └── utils.js             # Utility functions
│   └── 📁 assets/
│       ├── images/              # Image files
│       └── icons/               # Icon files
│
└── 📁 views/
    ├── heart-rate-monitor.html  # Main application page
    ├── error.html               # Error page
    └── 📁 partials/
        ├── header.html          # Header partial
        └── footer.html          # Footer partial
```

## 🔌 API Documentation

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": { "rss": 50000000, "heapTotal": 30000000 },
  "environment": "development"
}
```

### Historical Data
```http
GET /api/data/historical?start=2024-01-15T00:00:00Z&end=2024-01-15T23:59:59Z
```
**Parameters:**
- `start` (required): ISO date string
- `end` (required): ISO date string

**Response:**
```json
{
  "data": [
    {
      "_id": "65a5f1234567890abcdef123",
      "heartRate": 72,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "min": 65,
    "max": 95,
    "average": 78,
    "count": 150
  }
}
```

### Statistics
```http
GET /api/data/stats?start=2024-01-15T00:00:00Z&end=2024-01-15T23:59:59Z
```
**Response:**
```json
{
  "min": 65,
  "max": 95,
  "average": 78,
  "count": 150
}
```

### Recent Data
```http
GET /api/data/recent?limit=100
```
**Parameters:**
- `limit` (optional): Number of records (default: 100)

**Response:**
```json
[
  {
    "_id": "65a5f1234567890abcdef123",
    "heartRate": 72,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

## 🌐 Frontend Components

### WebSocket Client (`websocket-client.js`)
- Manages Socket.IO connection
- Handles real-time data reception
- Manages connection status

### Chart Manager (`chart-manager.js`)
- amCharts 5 integration
- Real-time chart updates
- Modern styling with black lines and dotted grids

### Stats Manager (`stats-manager.js`)
- Live statistics calculation
- UI updates for metrics cards
- Real-time min/max/average computation

### Main Application (`main.js`)
- Coordinates all components
- Manages application state
- Handles user interactions

## 🗄️ Database Schema

### HeartRateData Collection
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  heartRate: Number,       // Heart rate in BPM (required)
  timestamp: Date,         // Reading timestamp (required, indexed)
  createdAt: Date         // Auto-generated creation time
}
```

### Indexes
```javascript
// Timestamp index for efficient time-range queries
{ timestamp: 1 }

// Compound index for statistics queries (optional)
{ timestamp: 1, heartRate: 1 }
```

## 📡 WebSocket Integration

### Client-Side Events
```javascript
// Connection status updates
socket.on('connectionStatus', (status) => {
  // Handle connection status changes
});

// Real-time heart rate data
socket.on('heartRateData', (data) => {
  // Process new heart rate reading
});

// Recent data for initialization
socket.on('recentData', (data) => {
  // Load recent data on page load
});
```

### Server-Side Events
```javascript
// Request recent data
socket.emit('requestRecentData');

// Connection status broadcast
io.emit('connectionStatus', { connected: true });

// Heart rate data broadcast
io.emit('heartRateData', savedData);
```

## 🚀 Deployment

### Environment Setup
1. **Production Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=80
   MONGODB_URI=mongodb+srv://prod-user:secure-password@cluster.mongodb.net/
   SESSION_SECRET=very-secure-random-string-for-production
   ```

2. **Security Considerations:**
   - Use strong session secrets
   - Enable MongoDB authentication
   - Configure proper CORS origins
   - Use HTTPS in production
   - Implement rate limiting

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/heart_rate_monitor
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Cloud Deployment (Heroku)
1. **Prepare for Heroku:**
   ```bash
   # Install Heroku CLI
   npm install -g heroku

   # Login and create app
   heroku login
   heroku create your-app-name

   # Set environment variables
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set SESSION_SECRET=your-session-secret
   ```

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Cloud Deployment (DigitalOcean/AWS/GCP)
1. **Server Setup:**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2

   # Clone and setup application
   git clone your-repository
   cd heart-rate-monitor
   npm install --production
   ```

2. **Process Management:**
   ```bash
   # Start with PM2
   pm2 start server.js --name "heart-rate-monitor"
   
   # Enable auto-restart on reboot
   pm2 startup
   pm2 save
   ```

3. **Nginx Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
**Error:** `❌ Database connection failed`

**Solutions:**
```bash
# Check MongoDB URI format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Verify network access in MongoDB Atlas
# Add your IP to whitelist: 0.0.0.0/0 for testing

# Test connection manually
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
```

#### 2. WebSocket Connection Issues
**Error:** `❌ WebSocket error: getaddrinfo ENOTFOUND`

**Solutions:**
```bash
# Check internet connection
ping aide-twwwss-be02d4b95847.herokuapp.com

# Try debug URL first
WS_DEBUG_URL=ws://aide-twwwss-be02d4b95847.herokuapp.com/ws?debug=true

# Check firewall settings
# Ensure port 80/443 outbound is allowed
```

#### 3. Chart Not Rendering
**Error:** Chart shows loading forever

**Solutions:**
```javascript
// Check browser console for errors
// Verify amCharts scripts are loaded
console.log(typeof am5); // Should not be "undefined"

// Clear browser cache and reload
// Check network tab for failed script loads
```

#### 4. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
```bash
# Find and kill process using port
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev

# Or kill all node processes
pkill -f node
```

#### 5. Permission Denied (Linux/macOS)
**Error:** `EACCES: permission denied`

**Solutions:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use node version manager
# Install nvm and use it instead of system node
```

### Debugging Tools

#### 1. Enable Debug Logging
```javascript
// Add to server.js for verbose logging
process.env.DEBUG = 'socket.io:*';

// Or use environment variable
DEBUG=* npm run dev
```

#### 2. MongoDB Debugging
```javascript
// Enable MongoDB debug mode
mongoose.set('debug', true);

// Check database connection
db.adminCommand('ismaster')
```

#### 3. Network Debugging
```bash
# Test API endpoints
curl -v http://localhost:3001/health
curl -v http://localhost:3001/api/data/recent

# Test WebSocket connection
wscat -c ws://aide-twwwss-be02d4b95847.herokuapp.com/ws
```

### Performance Issues

#### 1. High Memory Usage
**Solutions:**
```javascript
// Limit data retention in memory
// Implement data cleanup in websocket-controller.js
setInterval(() => {
  // Clean old data every hour
}, 3600000);

// Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

#### 2. Chart Performance
**Solutions:**
```javascript
// Limit chart data points
const MAX_CHART_POINTS = 100;
chartData = data.slice(-MAX_CHART_POINTS);

// Throttle updates
let lastUpdate = 0;
if (Date.now() - lastUpdate > 1000) { // 1 second throttle
  updateChart();
  lastUpdate = Date.now();
}
```

### Getting Help

#### 1. Log Files
Check application logs:
```bash
# View real-time logs
tail -f logs/access.log

# View error logs
npm run dev 2>&1 | tee debug.log
```

#### 2. System Information
```bash
# Node.js and npm versions
node --version && npm --version

# System information
uname -a

# Memory and disk usage
free -h && df -h
```

#### 3. Browser Console
Open browser developer tools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Application tab for WebSocket connections


### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Check code coverage
npm run coverage
```
