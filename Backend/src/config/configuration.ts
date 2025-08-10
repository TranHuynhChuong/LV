export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3003', 10),
    url: process.env.BE_URL,
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

  frontend: {
    urls: (process.env.FE_URL ?? '')
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0),
  },

  zaloPay: {
    appId: process.env.APPID,
    key1: process.env.KEY1,
    key2: process.env.KEY2,
    createEndpoint: process.env.CREATE_ENDPOINT,
    queryEndpoint: process.env.QUERY_ENDPOINT,
  },
});
