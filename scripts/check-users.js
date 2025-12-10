require('dotenv').config();
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    console.log('Conectare la MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Conectat la MongoDB');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n=== Utilizatori în baza de date ===');
    console.log('Total utilizatori:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Nume: ${user.name}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Creat: ${user.createdAt}`);
    });

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('✗ Eroare:', error.message);
    process.exit(1);
  }
}

checkUsers();