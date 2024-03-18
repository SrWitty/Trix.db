const { MongoClient } = require('mongodb');
const fs = require('fs');
const crypto = require('crypto');

class Database {
    constructor(filename = 'Trix.json', encrypt = true, key) {
        this.filename = filename;
        this.encrypt = encrypt;
        this.key = key || crypto.randomBytes(32);
        this.iv = crypto.randomBytes(16);
        this.data = {};
        this.cache = {}; 
        this.loadData();
        
        
        this.cacheTTL = 60; 
        
        
        setInterval(() => {
            this.checkCacheExpiration();
        }, 1000); 
    }

    checkCacheExpiration() {
        const currentTime = Date.now();
        for (const key in this.cache) {
            const cachedData = this.cache[key];
            if (cachedData.expireAt && currentTime > cachedData.expireAt) {
                delete this.cache[key];
                console.log(`Expired cache item with key: ${key}`);
            }
        }
    }

    setCacheWithTTL(key, value, ttlInSeconds) {
        const expireAt = Date.now() + ttlInSeconds * 1000;
        this.cache[key] = { value, expireAt };
        console.log(`Data with key ${key} stored in cache with TTL ${ttlInSeconds} seconds`);
    }

    saveData() {
        try {
            const jsonData = JSON.stringify(this.data, null, 2);
            const finalData = this.encrypt ? this.encryptData(jsonData) : jsonData;
            fs.writeFileSync(this.filename, finalData, 'utf-8');
            console.log(`Data saved to ${this.filename}`);
        } catch (err) {
            console.error('Error saving data:', err);
        }
    }

    loadData() {
        try {
            let rawData = fs.readFileSync(this.filename, 'utf-8');
            if (this.encrypt) {
                rawData = this.decryptData(rawData);
            }
            this.data = JSON.parse(rawData);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    encryptData(data) {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.key), this.iv);
        let encryptedData = cipher.update(data, 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        return { iv: this.iv.toString('hex'), encryptedData };
    }

    decryptData(data) {
        const iv = Buffer.from(data.iv, 'hex');
        const encryptedData = Buffer.from(data.encryptedData, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.key), iv);
        let decryptedData = decipher.update(encryptedData);
        decryptedData = Buffer.concat([decipher.final()]);
        return decryptedData.toString();
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
        console.log('Encryption enabled.');
    }

    disableEncryption() {
        this.encrypt = false;
        this.loadData();
        console.log('Encryption disabled.');
    }

    async connectToMongoDB(url, dbName) {
        try {
            this.client = new MongoClient(url, { useUnifiedTopology: true });
            await this.client.connect();
            console.log('Connected to MongoDB server');
            this.db = this.client.db(dbName);
        } catch (err) {
            console.error('Error connecting to MongoDB:', err);
        }
    }

    async insertOne(collectionName, document) {
        try {
            const result = await this.db.collection(collectionName).insertOne(document);
            console.log(`Document inserted with _id: ${result.insertedId}`);
        } catch (err) {
            console.error('Error inserting document:', err);
        }
    }

    async findOne(collectionName, query) {
        try {
            const document = await this.db.collection(collectionName).findOne(query);
            console.log('Document found:', document);
            return document;
        } catch (err) {
            console.error('Error finding document:', err);
        }
    }

    async updateOne(collectionName, filter, update) {
        try {
            const result = await this.db.collection(collectionName).updateOne(filter, { $set: update });
            console.log(`Document updated: ${result.modifiedCount} document(s) modified`);
        } catch (err) {
            console.error('Error updating document:', err);
        }
    }

    async deleteOne(collectionName, filter) {
        try {
            const result = await this.db.collection(collectionName).deleteOne(filter);
            console.log(`Document deleted: ${result.deletedCount} document(s) deleted`);
        } catch (err) {
            console.error('Error deleting document:', err);
        }
    }

    async connect() {
        if (!this.client.isConnected()) {
            try {
                await this.client.connect();
                console.log('Connected to MongoDB server');
            } catch (err) {
                console.error('Error connecting to MongoDB:', err);
            }
        } else {
            console.log('Already connected to MongoDB server');
        }
    }

    async disconnect() {
        if (this.client.isConnected()) {
            try {
                await this.client.close();
                console.log('Disconnected from MongoDB server');
            } catch (err) {
                console.error('Error disconnecting from MongoDB:', err);
            }
        } else {
            console.log('Already disconnected from MongoDB server');
        }
    }

    enableCache() {
        this.cacheEnabled = true;
        console.log('CacheDriver enabled.');
    }

    disableCache() {
        this.cacheEnabled = false;
        this.cache = {}; // Clear cache
        console.log('CacheDriver disabled.');
    }

    fetch() {
        if (this.cacheEnabled) {
            return this.cache;
        } else {
            return this.data;
        }
    }

    fetchAll() {
        if (this.cacheEnabled) {
            return Object.assign({}, this.cache);
        } else {
            return Object.assign({}, this.data);
        }
    }

    all() {
        if (this.cacheEnabled) {
            return this.cache;
        } else {
            return this.data;
        }
    }

    backup(filename) {
        const backupData = JSON.stringify(this.data, null, 2);
        fs.writeFileSync(filename, backupData, 'utf-8');
        console.log(`Backup created as ${filename}`);
    }

    reset() {
        this.data = {};
        this.saveData();
    }

    async init(table) {
        if (this.db) return true;
        await this.client.connect();
        this.db = this.client.db(table);
        return true;
    }

    async setRowByKey(table, key, value) {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.collection(table).updateOne({ key }, { $set: { value: JSON.stringify(value) } }, { upsert: true });
        return true;
    }

    async getAllRows(table) {
        if (!this.db) throw new Error('Database not initialized');
        const cursor = await this.db.collection(table).find();
        const data = {};
        await cursor.forEach((doc) => {
            data[doc.key] = JSON.parse(doc.value);
        });
        return data;
    }

    async getRowByKey(table, key) {
        if (!this.db) throw new Error('Database not initialized');
        const doc = await this.db.collection(table).findOne({ key });
        
        if (!doc) return doc;
        return JSON.parse(doc.value);
    }

    async deleteRowByKey(table, key) {
        if (!this.db) throw new Error('Database not initialized');
        const result = await this.db.collection(table).deleteOne({ key });
        return result.deletedCount || 0;
    }

    async deleteAllRows(table) {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.collection(table).deleteMany({});
        return true;
    }

    async close() {
        if (!this.db) throw new Error('Database not initialized');
        await this.client.close();
        this.db = undefined;
        return true;
    }
}

module.exports = Database;
