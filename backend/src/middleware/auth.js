const prisma = require('../config/db');

const dummyAuth = async (req, res, next) => {
  try {
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: 'Yash Gahlot',
          email: 'yash@test.com'
        }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

module.exports = dummyAuth;
