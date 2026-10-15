import express from 'express';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';

import router from './src/modules/Auth/auth.route.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('dev'));


const limiter = rateLimiter({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again after an hour'
});

app.use('/api', limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//Routes
app.use('/api/users',router)


export default app;