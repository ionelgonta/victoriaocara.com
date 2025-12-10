require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
      console.log('Verifică că fișierul .env există și conține MONGODB_URI');
      process.exit(1);
    }
    
    console.log('Conectare la:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectat la MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    rl.question('Email admin: ', async (email) => {
      rl.question('Parolă admin: ', async (password) => {
        rl.question('Nume admin: ', async (name) => {
          
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            console.log('✗ Un utilizator cu acest email există deja!');
            process.exit(1);
          }

          const hashedPassword = await bcrypt.hash(password, 12);

          const admin = await User.create({
            email,
            password: hashedPassword,
            name,
            role: 'admin'
          });

          console.log('\n✓ Admin creat cu succes!');
          console.log('Email:', admin.email);
          console.log('Nume:', admin.name);
          console.log('\nPoți acum să te autentifici la /admin');

          await mongoose.connection.close();
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('✗ Eroare:', error.message);
    process.exit(1);
  }
}

createAdmin();
