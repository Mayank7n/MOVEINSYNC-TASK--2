const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const auth = require('./routes/auth');
const events = require('./routes/events');
const bookings = require('./routes/bookings');

const app = express();

app.use(express.json());

app.use(cors());

app.use('/api/v1/auth', auth);
app.use('/api/v1/events', events);
app.use('/api/v1/bookings', bookings);

app.use((err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', {
        message: err.message,
        name: err.name,
        statusCode: err.statusCode,
        code: err.code,
        keyValue: err.keyValue
    });
    
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: messages
        });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate field value entered'
        });
    }
    
    // Handle ObjectId format errors
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Resource not found'
        });
    }
    
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Set port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');
        
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error(`Error: ${err.message}`);
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

startServer();
