const { MongoClient } = require('mongodb');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class Database {
    constructor(options = {}) {
        const {
            filename = 'Trix.json',
            encrypt = true,
            algorithm = 'aes-256-cbc',
            key = crypto.randomBytes(32),
            iv = crypto.randomBytes(16),
            logsEnabled = true,
            logFilename = 'Trix.log'
        } = options;

        this.filename = filename;
        this.encrypt = encrypt;
        this.algorithm = algorithm;
        this.key = key;
        this.iv = iv;
        this.logsEnabled = logsEnabled;
        this.logFilename = logFilename;
        this.logStreams = {};

        this.data = {};
        this.cache = {};
        this.cacheTTL = 60;

        this.initLogs();
        this.loadData();

        setInterval(() => {
            this.checkCacheExpiration();
        }, 1000);

        this.sqlData = {};
    }

    initLogs() {
        if (this.logsEnabled) {
            this.logStreams.default = fs.createWriteStream(this.logFilename, { flags: 'a' });
        }
    }

    createLogStream(filename) {
        if (!this.logStreams[filename]) {
            this.logStreams[filename] = fs.createWriteStream(filename, { flags: 'a' });
        }
    }

    log(message, filename = 'default') {
        if (this.logsEnabled) {
            const timestamp = new Date().toISOString();
            this.logStreams[filename].write(`${timestamp}: ${message}\n`);
        }
    }

    checkCacheExpiration() {
        const currentTime = Date.now();
        for (const key in this.cache) {
            const cachedData = this.cache[key];
            if (cachedData.expireAt && currentTime > cachedData.expireAt) {
                delete this.cache[key];
                this.log(`Expired cache item with key: ${key}`);
            }
        }
    }

    setCacheWithTTL(key, value, ttlInSeconds) {
        const expireAt = Date.now() + ttlInSeconds * 1000;
        this.cache[key] = { value, expireAt };
        this.log(`Data with key ${key} stored in cache with TTL ${ttlInSeconds} seconds`);
    }

    saveData() {
        try {
            const jsonData = JSON.stringify(this.data, null, 2);
            const finalData = this.encrypt ? this.encryptData(jsonData) : jsonData;
            fs.writeFileSync(this.filename, finalData, 'utf-8');
            this.log(`Data saved to ${this.filename}`);
        } catch (err) {
            console.error('Error saving data:', err);
            this.log(`Error saving data: ${err.message}`);
        }
    }

    loadData() {
        try {
            if (!fs.existsSync(this.filename)) {
                fs.writeFileSync(this.filename, '{}', 'utf-8');
            }
            let rawData = fs.readFileSync(this.filename, 'utf-8');
            if (this.encrypt && rawData) {
                rawData = this.decryptData(rawData);
            }
            this.data = JSON.parse(rawData || '{}');
        } catch (err) {
            console.error('Error loading data:', err);
            this.log(`Error loading data: ${err.message}`);
        }
    }

    encryptData(data) {
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let encryptedData = cipher.update(data, 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        return { iv: this.iv.toString('hex'), encryptedData };
    }

    decryptData(data) {
        const iv = Buffer.from(data.iv, 'hex');
        const encryptedData = Buffer.from(data.encryptedData, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), iv);
        let decryptedData = decipher.update(encryptedData);
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);
        return decryptedData.toString();
    }

    changeEncryptionKey(newKey, newIV) {
        this.key = newKey;
        this.iv = newIV;
        this.loadData();
        this.log('Encryption key and IV changed.');
    }

    set(key, value) {
        this.data[key] = value;
        this.saveData();
    }

    get(key) {
        return this.data[key];
    }

    delete(key) {
        delete this.data[key];
        this.saveData();
    }

    has(key) {
        return key in this.data;
    }

    add(key, num) {
        if (typeof this.data[key] === 'number') {
            this.data[key] += num;
            this.saveData();
        }
    }

    subtract(key, num) {
        if (typeof this.data[key] === 'number') {
            this.data[key] -= num;
            this.saveData();
        }
    }

    push(key, item) {
        if (!Array.isArray(this.data[key])) {
            this.data[key] = [];
        }
        this.data[key].push(item);
        this.saveData();
    }

    pushArray(key, items) {
        if (!Array.isArray(this.data[key])) {
            this.data[key] = [];
        }
        this.data[key].push(...items);
        this.saveData();
        this.log(`Items added to array ${key}: ${items}`);
    }

    removeFromArray(key, items) {
        if (Array.isArray(this.data[key])) {
            this.data[key] = this.data[key].filter(item => !items.includes(item));
            this.saveData();
            this.log(`Items removed from array ${key}: ${items}`);
        }
    }

    math(key, operator, num) {
        if (typeof this.data[key] === 'number') {
            if (operator === '+') {
                this.data[key] += num;
            } else if (operator === '-') {
                this.data[key] -= num;
            } else if (operator === '*') {
                this.data[key] *= num;
            } else if (operator === '/') {
                this.data[key] /= num;
            }
            this.saveData();
        }
    }

    enableEncryption() {
        this.encrypt = true;
        this.loadData();
        this.log('Encryption enabled.');
    }

    disableEncryption() {
        this.encrypt = false;
        this.loadData();
        this.log('Encryption disabled.');
    }

    async connectToMongoDB(url, dbName) {
        try {
            this.client = new MongoClient(url, { useUnifiedTopology: true });
            await this.client.connect();
            this.log('Connected to MongoDB server');
            this.db = this.client.db(dbName);
        } catch (err) {
            console.error('Error connecting to MongoDB:', err);
            this.log(`Error connecting to MongoDB: ${err.message}`);
        }
    }

    async insertOne(collectionName, document) {
        try {
            const result = await this.db.collection(collectionName).insertOne(document);
            this.log(`Document inserted with _id: ${result.insertedId}`);
        } catch (err) {
            console.error('Error inserting document:', err);
            this.log(`Error inserting document: ${err.message}`);
        }
    }

    async findOne(collectionName, query) {
        try {
            const document = await this.db.collection(collectionName).findOne(query);
            this.log(`Document found: ${JSON.stringify(document)}`);
            return document;
        } catch (err) {
            console.error('Error finding document:', err);
            this.log(`Error finding document: ${err.message}`);
        }
    }

    async updateOne(collectionName, filter, update) {
        try {
            const result = await this.db.collection(collectionName).updateOne(filter, { $set: update });
            this.log(`Document updated: ${result.modifiedCount} document(s) modified`);
        } catch (err) {
            console.error('Error updating document:', err);
            this.log(`Error updating document: ${err.message}`);
        }
    }

    async deleteOne(collectionName, filter) {
        try {
            const result = await this.db.collection(collectionName).deleteOne(filter);
            this.log(`Document deleted: ${result.deletedCount} document(s) deleted`);
        } catch (err) {
            console.error('Error deleting document:', err);
            this.log(`Error deleting document: ${err.message}`);
        }
    }

    async connect() {
        if (!this.client.isConnected()) {
            try {
                await this.client.connect();
                this.log('Connected to MongoDB server');
            } catch (err) {
                console.error('Error connecting to MongoDB:', err);
                this.log(`Error connecting to MongoDB: ${err.message}`);
            }
        } else {
            this.log('Already connected to MongoDB server');
        }
    }

    async disconnect() {
        if (this.client.isConnected()) {
            try {
                await this.client.close();
                this.log('Disconnected from MongoDB server');
            } catch (err) {
                console.error('Error disconnecting from MongoDB:', err);
                this.log(`Error disconnecting from MongoDB: ${err.message}`);
            }
        } else {
            this.log('Already disconnected from MongoDB server');
        }
    }

    enableCache() {
        this.cacheEnabled = true;
        this.log('CacheDriver enabled.');
    }

    disableCache() {
        this.cacheEnabled = false;
        this.cache = {};
        this.log('CacheDriver disabled.');
    }

    fetch() {
        if (this.cacheEnabled) {
            return this.cache;
        } else {
            return this.data;
        }
    }

    notify(message) {
        // Implement notification mechanism (e.g., email, push notification, etc.)
        this.log(`Notification: ${message}`);
    }

    saveCache(filename) {
        fs.writeFileSync(filename, JSON.stringify(this.cache), 'utf-8');
        this.log(`Cache saved to ${filename}`);
    }

    loadCache(filename) {
        const cacheData = fs.readFileSync(filename, 'utf-8');
        this.cache = JSON.parse(cacheData);
        this.log(`Cache loaded from ${filename}`);
    }

    async startTransaction() {
        this.currentSession = this.client.startSession();
        this.currentSession.startTransaction();
    }

    async commitTransaction() {
        await this.currentSession.commitTransaction();
        this.log('Transaction committed.');
    }

    async rollbackTransaction() {
        await this.currentSession.abortTransaction();
        this.log('Transaction rolled back.');
    }

    initMultipleLogs(logTypes) {
        if (this.logsEnabled) {
            logTypes.forEach(type => {
                this.logStreams[type] = fs.createWriteStream(`${type}_${this.logFilename}`, { flags: 'a' });
            });
        }
    }

    disableLogs() {
        this.logsEnabled = false;
        for (const stream in this.logStreams) {
            this.logStreams[stream].end();
        }
        this.logStreams = {};
        this.log('Logging disabled.');
    }

    async insertPostgreSQL(connectionOptions, table, document) {
        const client = new Client(connectionOptions);
        try {
            await client.connect();
            
            const keys = Object.keys(document).join(', ');
            const values = Object.values(document);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
            const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders}) RETURNING *`;
            const res = await client.query(query, values);
            
            this.log(`Document inserted into PostgreSQL table ${table}: ${JSON.stringify(res.rows[0])}`);
            
            return res.rows[0];
        } catch (err) {
            console.error('Error inserting into PostgreSQL:', err);
            this.log(`Error inserting into PostgreSQL: ${err.message}`);
            throw err;
        } finally {
            await client.end();
        }
    }
    

    

async findOneSQLite(databaseFile, table, query) {
    const db = new sqlite3.Database(databaseFile);
    
    const keys = Object.keys(query);
    const values = Object.values(query);
    const placeholders = keys.map(key => `${key} = ?`).join(' AND ');

    const sql = `SELECT * FROM ${table} WHERE ${placeholders} LIMIT 1`;

    return new Promise((resolve, reject) => {
        db.get(sql, values, (err, row) => {
            if (err) {
                console.error('Error finding document in SQLite:', err);
                this.log(`Error finding document in SQLite: ${err.message}`);
                reject(err);
            } else {
                this.log(`Document found in SQLite table ${table}: ${JSON.stringify(row)}`);
                resolve(row);
            }
            db.close();
        });
    });
}


}

module.exports = Database;
