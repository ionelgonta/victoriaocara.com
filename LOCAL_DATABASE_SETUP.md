# Configurare MongoDB Local

## Prezentare Generală
Acest ghid te ajută să migrezi de la MongoDB Atlas la o instalare MongoDB locală pe serverul tău.

## Avantaje MongoDB Local
- ✅ **Control complet** asupra datelor
- ✅ **Fără costuri** pentru hosting database
- ✅ **Performanță mai bună** (latență redusă)
- ✅ **Backup local** automat
- ✅ **Independență** de servicii externe

## Instalare Automată (Recomandat)

### Opțiunea 1: Setup Complet Automat
```bash
# Conectează-te la server
ssh root@23.88.113.154

# Navighează la directorul proiectului
cd /opt/victoriaocara

# Rulează setup-ul complet (instalare + migrare)
chmod +x setup-complete-local-db.sh
./setup-complete-local-db.sh
```

### Opțiunea 2: Pas cu Pas
```bash
# 1. Instalează MongoDB local
chmod +x setup-local-mongodb.sh
./setup-local-mongodb.sh

# 2. Migrează datele de la Atlas
chmod +x migrate-data.sh
./migrate-data.sh

# 3. Actualizează .env și restart aplicația
nano .env  # Schimbă MONGODB_URI
pm2 restart victoriaocara
```

## Configurare Manuală

### 1. Instalare MongoDB
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
apt-get update
apt-get install -y mongodb-org

# Start service
systemctl start mongod
systemctl enable mongod
```

### 2. Configurare Securitate
```bash
# Creează admin user
mongosh --eval "
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'VictoriaOcara2024!',
  roles: ['userAdminAnyDatabase', 'readWriteAnyDatabase', 'dbAdminAnyDatabase']
});
"

# Creează user pentru aplicație
mongosh --eval "
db = db.getSiblingDB('admin');
db.auth('admin', 'VictoriaOcara2024!');

db = db.getSiblingDB('art-gallery');
db.createUser({
  user: 'victoriaocara',
  pwd: 'ArtGallery2024!',
  roles: [{ role: 'readWrite', db: 'art-gallery' }]
});
"
```

### 3. Migrare Date
```bash
# Export de la Atlas
mongodump --uri="mongodb+srv://ionelgonta_db_user:ArtGallery2024!@art-gallery-cluster.ncpcxsd.mongodb.net/art-gallery" --out="/tmp/atlas-backup"

# Import în local
mongorestore --uri="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" --drop "/tmp/atlas-backup/art-gallery"
```

### 4. Actualizare Aplicație
```bash
# Editează .env
nano /opt/victoriaocara/.env

# Schimbă linia:
MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery

# Restart aplicația
pm2 restart victoriaocara
```

## Informații Conexiune

### Connection String
```
mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery
```

### Credențiale
- **Host**: localhost
- **Port**: 27017
- **Database**: art-gallery
- **Username**: victoriaocara
- **Password**: ArtGallery2024!

### Admin Credențiale
- **Username**: admin
- **Password**: VictoriaOcara2024!

## Backup și Mentenanță

### Backup Automat
Script-ul creează automat:
- 📁 `/opt/backup-mongodb.sh` - Script de backup
- ⏰ Cron job zilnic la 2 AM
- 🗂️ Păstrează ultimele 7 backup-uri

### Backup Manual
```bash
# Rulează backup
/opt/backup-mongodb.sh

# Sau manual
mongodump --uri="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" --out="/opt/backups/manual-$(date +%Y%m%d)"
```

### Restore din Backup
```bash
# Restore din backup
mongorestore --uri="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" --drop "/opt/backups/BACKUP_FOLDER"
```

## Comenzi Utile

### Status și Monitoring
```bash
# Status MongoDB
systemctl status mongod

# Conectare la MongoDB
mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery

# Logs MongoDB
tail -f /var/log/mongodb/mongod.log

# Status aplicație
pm2 status
pm2 logs victoriaocara
```

### Administrare
```bash
# Restart MongoDB
systemctl restart mongod

# Restart aplicația
pm2 restart victoriaocara

# Verifică conexiunea
mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery --eval "db.runCommand('ping')"
```

## Troubleshooting

### Probleme Comune

#### MongoDB nu pornește
```bash
# Verifică logs
journalctl -u mongod

# Verifică configurația
cat /etc/mongod.conf

# Restart service
systemctl restart mongod
```

#### Aplicația nu se conectează
```bash
# Verifică .env
cat /opt/victoriaocara/.env | grep MONGODB_URI

# Test conexiunea
mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery

# Verifică logs aplicație
pm2 logs victoriaocara
```

#### Erori de autentificare
```bash
# Verifică utilizatorii
mongosh --eval "db.getSiblingDB('admin').auth('admin', 'VictoriaOcara2024!'); db.getSiblingDB('art-gallery').getUsers()"

# Recreează utilizatorul
mongosh --eval "
db = db.getSiblingDB('admin');
db.auth('admin', 'VictoriaOcara2024!');
db = db.getSiblingDB('art-gallery');
db.dropUser('victoriaocara');
db.createUser({user: 'victoriaocara', pwd: 'ArtGallery2024!', roles: [{role: 'readWrite', db: 'art-gallery'}]});
"
```

## Securitate

### Configurări Implementate
- ✅ **Autentificare activată** pentru toate conexiunile
- ✅ **Bind doar pe localhost** (nu acceptă conexiuni externe)
- ✅ **Firewall configurat** să blocheze portul 27017 extern
- ✅ **Utilizatori separați** pentru admin și aplicație
- ✅ **Backup-uri criptate** (opțional)

### Recomandări Suplimentare
- 🔒 Schimbă parolele default după instalare
- 🛡️ Monitorizează logs-urile regulat
- 💾 Testează restore-ul din backup periodic
- 🔄 Actualizează MongoDB regulat

## Status Final
După configurare, vei avea:
- 🗄️ **MongoDB local** complet funcțional
- 🔄 **Date migrate** de la Atlas
- 💾 **Backup automat** zilnic
- 🔒 **Securitate configurată**
- 🚀 **Aplicația funcțională** cu baza locală

**Felicitări! Acum ai independență completă de serviciile externe!** 🎉