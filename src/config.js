import { config } from "dotenv";

config()

export const PORT = process.env.PORT || 3000
export const DB_USER = process.env.DB_USER  || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'hachepassword'
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_DATABASE = process.env.DB_DATABASE || 'gastosdb'
export const DB_PORT = process.env.DB_PORT || 3306

// Clerk configuration
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY
export const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY
export const CLERK_FRONTEND_URL = process.env.CLERK_FRONTEND_URL || 'http://localhost:5173'