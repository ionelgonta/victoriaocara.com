require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

async function createAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.log('✗ MONGODB_URI nu este setat în .env');
      process.exit(1);
    }
    
    console.log('Conectare la MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectat la MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Șterge admin-ul existent dacă există
    await User.deleteOne({ email: 'admin@victoriaocara.com' });
    console.log('✓ Admin vechi șters (dacă exista)');

    // Creează admin nou
    const hashedPassword = await bcrypt.hash('AdminVictoria2024!', 12);

    const admin = await User.create({
      email: 'admin@victoriaocara.com',
      password: hashedPassword,
      name: 'Victoria Ocara Admin',
      role: 'admin'
    });

    console.log('\n✓ Admin creat cu succes!');
    console.log('Email:', admin.email);
    console.log('Parolă: AdminVictoria2024!');
    console.log('Nume:', admin.name);
    console.log('Rol:', admin.role);
    console.log('\nPoți acum să te autentifici la /admin');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('✗ Eroare:', error.message);
    process.exit(1);
  }
}

createAdmin();