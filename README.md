# Time Tracking Web Application

A full-stack time tracking application built with Node.js, Express, MongoDB, and React.js with Redux Toolkit for state management. Users can track time on multiple projects and tasks, with comprehensive reporting and dashboard features.

## Features

### Core Functionality
- **User Management**: Secure registration and login with JWT authentication
- **Project Management**: Create, update, and delete projects with descriptions
- **Task Management**: Add tasks to projects with optional descriptions
- **Time Tracking**: Start/stop timers and manual time entry
- **Dashboard**: Real-time summaries and statistics
- **Reporting**: Weekly views and project/task breakdowns

### Key Features
- Single timer restriction (only one timer can run at a time)
- Manual time entry with start/end times or duration
- Filterable time logs by project and date range
- Today's and weekly totals
- Project and task summaries
- Weekly breakdown with daily totals

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **moment.js** - Date/time manipulation

### Frontend
- **React.js** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Moment.js** - Date/time manipulation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd time-tracking-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/time-tracking-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud instance.

6. **Run the application**
   ```bash
   # Development mode (both backend and frontend)
   npm run dev:full
   
   # Or run separately:
   # Backend only
   npm run dev
   
   # Frontend only
   cd client && npm start
   ```

## Redux Toolkit Implementation

The application uses Redux Toolkit for state management with the following structure:

### Store Structure
```
store/
├── index.js          # Store configuration
├── hooks.js          # Custom Redux hooks
└── slices/
    ├── authSlice.js      # Authentication state
    ├── projectSlice.js   # Project management
    ├── taskSlice.js      # Task management
    ├── timeLogSlice.js   # Time tracking
    └── dashboardSlice.js # Dashboard data
```

### Key Redux Features
- **Async Thunks**: Handle API calls and async operations
- **Slice Reducers**: Organized state management by feature
- **Immer Integration**: Immutable state updates with mutable syntax
- **DevTools Integration**: Built-in Redux DevTools support
- **Error Handling**: Centralized error management
- **Loading States**: Consistent loading state management

### State Management Benefits
- **Centralized State**: All application state in one place
- **Predictable Updates**: Immutable state updates
- **Developer Tools**: Redux DevTools for debugging
- **Performance**: Optimized re-renders with useSelector
- **Scalability**: Easy to add new features and state

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get user profile

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id` - Get specific project

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id` - Get specific task

### Time Logs
- `GET /api/timelogs` - Get all time logs
- `POST /api/timelogs/start` - Start timer
- `POST /api/timelogs/stop` - Stop timer
- `POST /api/timelogs` - Create manual entry
- `PUT /api/timelogs/:id` - Update time log
- `DELETE /api/timelogs/:id` - Delete time log
- `GET /api/timelogs/current` - Get running timer

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/projects` - Get project totals
- `GET /api/dashboard/tasks` - Get task totals
- `GET /api/dashboard/weekly` - Get weekly breakdown

## Database Schema

### User
- `username` (required, unique)
- `email` (required, unique)
- `password` (required, hashed)
- `createdAt`

### Project
- `name` (required)
- `description` (optional)
- `user` (reference to User)
- `createdAt`, `updatedAt`

### Task
- `name` (required)
- `description` (optional)
- `project` (reference to Project)
- `user` (reference to User)
- `createdAt`, `updatedAt`

### TimeLog
- `task` (reference to Task)
- `user` (reference to User)
- `startTime` (required)
- `endTime` (optional)
- `duration` (calculated in minutes)
- `description` (optional)
- `isRunning` (boolean)
- `createdAt`, `updatedAt`

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start React development server
- `npm run build` - Build React app for production
- `npm run dev:full` - Start both backend and frontend

### Project Structure
```
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── store/       # Redux store and slices
│   │   └── contexts/    # React contexts (legacy)
│   └── public/          # Static files
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Redux State Structure

```javascript
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  projects: {
    projects: [],
    loading: false,
    error: null,
    currentProject: null
  },
  tasks: {
    tasks: [],
    loading: false,
    error: null,
    currentTask: null
  },
  timeLogs: {
    timeLogs: [],
    currentTimer: null,
    loading: false,
    error: null
  },
  dashboard: {
    summary: null,
    projectTotals: [],
    taskTotals: [],
    weeklyData: [],
    loading: false,
    error: null
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Next Steps

- [ ] Add PDF export functionality
- [ ] Implement real-time updates with WebSocket
- [ ] Add data visualization charts
- [ ] Create mobile-responsive design
- [ ] Add user preferences and settings
- [ ] Implement offline functionality with Redux Persist
- [ ] Add unit tests for Redux slices
- [ ] Implement advanced filtering and search 