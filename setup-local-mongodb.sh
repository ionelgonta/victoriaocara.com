#!/bin/bash

# Script pentru instalarea și configurarea MongoDB local pe server
set -e

echo "🗄️ Instalez și configurez MongoDB local..."

# 1. Instalează MongoDB
echo "📦 Instalez MongoDB Community Edition..."

# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
apt-get update

# Install MongoDB
apt-get install -y mongodb-org

# 2. Configurează MongoDB
echo "⚙️ Configurez MongoDB..."

# Creează directoarele necesare
mkdir -p /var/lib/mongodb
mkdir -p /var/log/mongodb

# Setează permisiunile
chown mongodb:mongodb /var/lib/mongodb
chown mongodb:mongodb /var/log/mongodb

# Configurează MongoDB
cat > /etc/mongod.conf << 'EOF'
# mongod.conf

# for documentation of all options, see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# Where to store data
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Where to write logging data
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Security
security:
  authorization: enabled

# Replica set (optional, for production)
#replication:
#  replSetName: "rs0"
EOF

# 3. Pornește MongoDB
echo "🚀 Pornesc MongoDB..."
systemctl start mongod
systemctl enable mongod

# Verifică statusul
systemctl status mongod --no-pager

# 4. Creează utilizatorul admin
echo "👤 Creez utilizatorul admin pentru MongoDB..."

# Așteaptă ca MongoDB să pornească complet
sleep 5

# Creează admin user
mongosh --eval "
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'VictoriaOcara2024!',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' },
    { role: 'dbAdminAnyDatabase', db: 'admin' }
  ]
});
"

# 5. Creează baza de date pentru aplicație
echo "🗃️ Creez baza de date pentru aplicație..."

mongosh --eval "
db = db.getSiblingDB('admin');
db.auth('admin', 'VictoriaOcara2024!');

db = db.getSiblingDB('art-gallery');
db.createUser({
  user: 'victoriaocara',
  pwd: 'ArtGallery2024!',
  roles: [
    { role: 'readWrite', db: 'art-gallery' }
  ]
});

// Creează colecțiile de bază
db.createCollection('paintings');
db.createCollection('users');
db.createCollection('orders');
db.createCollection('images');
db.createCollection('public_images');
db.createCollection('similar_requests');
db.createCollection('custom_painting_requests');
db.createCollection('price_offers');
db.createCollection('about_content');

// Creează indexuri pentru performanță
db.paintings.createIndex({ 'slug': 1 }, { unique: true });
db.paintings.createIndex({ 'featured': 1 });
db.paintings.createIndex({ 'sold': 1 });
db.users.createIndex({ 'email': 1 }, { unique: true });
db.orders.createIndex({ 'createdAt': -1 });

print('✅ Baza de date configurată cu succes!');
"

# 6. Configurează firewall pentru MongoDB (doar local)
echo "🛡️ Configurez firewall pentru MongoDB..."
ufw deny 27017

# 7. Creează script de backup
echo "💾 Creez script de backup..."
cat > /opt/backup-mongodb.sh << 'EOF'
#!/bin/bash
# Script de backup pentru MongoDB

BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "🗄️ Creez backup MongoDB..."
mongodump --host localhost:27017 --username admin --password VictoriaOcara2024! --authenticationDatabase admin --out $BACKUP_DIR/$DATE

# Păstrează doar ultimele 7 backup-uri
find $BACKUP_DIR -type d -name "20*" -mtime +7 -exec rm -rf {} \;

echo "✅ Backup creat: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-mongodb.sh

# 8. Configurează backup automat (zilnic la 2 AM)
echo "⏰ Configurez backup automat..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-mongodb.sh") | crontab -

echo ""
echo "🎉 MongoDB instalat și configurat cu succes!"
echo ""
echo "📊 Informații conexiune:"
echo "   Host: localhost"
echo "   Port: 27017"
echo "   Database: art-gallery"
echo "   Username: victoriaocara"
echo "   Password: ArtGallery2024!"
echo ""
echo "🔧 Connection String pentru aplicație:"
echo "   mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo ""
echo "📝 Comenzi utile:"
echo "   systemctl status mongod     # Status MongoDB"
echo "   mongosh                     # Conectare la MongoDB"
echo "   /opt/backup-mongodb.sh      # Backup manual"
echo ""
echo "⚠️ URMĂTORUL PAS: Actualizează fișierul .env cu noua conexiune!"
echo ""