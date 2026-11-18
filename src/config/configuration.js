export default () => ({
  port: Number.parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collabtime',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
});
