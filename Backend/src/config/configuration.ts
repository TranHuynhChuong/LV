// src/config/configuration.ts
export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    uri: process.env.MONGO_URI,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  admin: {
    code: process.env.CODE,
    pass: process.env.PASS,
  },
});
