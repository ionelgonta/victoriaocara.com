export const isAdmin = (req: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return false;
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded && decoded.role === 'admin';
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, role: string) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
};
