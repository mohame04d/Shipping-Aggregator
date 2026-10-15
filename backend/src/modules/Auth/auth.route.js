import express from "express";
import { signUp, login, logOut, refreshToken, protect, getMe } from './auth.controller.js';
import validate from "../../middlewares/validate.middleware.js";
import { signUpSchema, loginSchema } from "./auth.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Management
 */

/**
 * @swagger
 * /api/users/signUp:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mohamed Ahmed
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/signUp', validate(signUpSchema), signUp);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/users/logOut:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logOut', protect, logOut);

/**
 * @swagger
 * /api/users/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refreshToken', refreshToken);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/me', protect, getMe);

export default router;