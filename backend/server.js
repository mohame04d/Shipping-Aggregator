import dotenv from 'dotenv';

dotenv.config({ path: './src/config/.env' });

import app from './app.js';
import prisma from './src/config/prisma.js';

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.message, err.stack);

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
    });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message, err.stack);

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');

    server.close(async () => {
        await prisma.$disconnect();
        console.log('💥 Process terminated!');
        process.exit(0);
    });
});