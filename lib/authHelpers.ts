export const isAdmin = (req: any) => {
  const authHeader = req.headers.get('authorization');
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header');
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found');
    return false;
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Decoded token:', decoded);
    
    const isValidAdmin = decoded && decoded.role === 'admin';
    console.log('Is valid admin:', isValidAdmin);
    
    return isValidAdmin;
  } catch (error) {
    console.log('Token verification error:', error);
    return false;
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
