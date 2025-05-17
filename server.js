const express = require('express');
const cors = require('cors');
const passport = require('passport');
const config = require('./config/database');
const mysql = require('mysql2/promise');
const path = require('path');

// Create MySQL connection pool
const pool = mysql.createPool(config.database);

// Import routes using the existing files
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');
const transactionRoutes = require('./routes/transaction');
const ticketRoutes = require('./routes/ticket');
const winningTicketRoutes = require('./routes/winning-ticket');
const transferRecipientRoutes = require('./routes/transfer-recipient');
const gameCategoryRoutes = require('./routes/game-category');
const simpleRoutes = require('./simple-routes');
const directServer = require('./direct-server');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  // Log registered routes for debugging
  if (req.url.includes('/api/simple')) {
    console.log('Available routes:', app._router.stack
      .filter(r => r.route)
      .map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));
  }
  
  next();
});

// Enable preflight for all OPTIONS requests
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

// Mount simple routes first (no auth required)
app.use('/api/simple', simpleRoutes);

// Mount direct server routes
// app.use('/api/simple', directServer);

// Root endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('Welcome to Padi Lotto api');
});

// Routes that require authentication
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/games', gameRoutes);
app.use('/transactions', transactionRoutes);
app.use('/tickets', ticketRoutes);
app.use('/winning-tickets', winningTicketRoutes);
app.use('/transfer-recipients', transferRecipientRoutes);
app.use('/game-categories', gameCategoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, msg: 'Something went wrong!' });
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist')));

// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Registered endpoints:');
    console.log('- GET / (API root)');
    console.log('- POST /api/simple/tickets');
    console.log('- GET /api/simple/all-tickets');
    console.log('- POST /api/simple/transactions');
    console.log('- POST /api/simple/transaction');
    console.log('... and others through route modules');
});

// Handle common shutdown scenarios to close database connections gracefully
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        pool.end()
            .then(() => {
                console.log('Database connections closed');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error closing database connections:', err);
                process.exit(1);
            });
    });
});
