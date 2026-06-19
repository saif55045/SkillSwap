import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
    MONGO_URI: process.env.MONGO_URI || 'your_mongodb_atlas_uri',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    PORT: process.env.PORT || 5000,
    SALT_ROUNDS: 10,
    
    // Email configuration
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_SECURE: process.env.EMAIL_SECURE || false,
    EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'your-app-password',
    EMAIL_FROM: process.env.EMAIL_FROM || 'your-email@gmail.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'SkillSwap Team'
};