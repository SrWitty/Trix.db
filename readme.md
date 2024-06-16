```markdown
# Trix Database Package

## Overview
Trix Database is a powerful Node.js package for managing data with built-in support for encryption, MongoDB integration, SQLite3, PostgreSQL, and caching. It provides an intuitive interface for storing, retrieving, and manipulating data efficiently.

## Version
TrixDB Version Is: **1.0.4**

## Installation
You can install the Trix Database package via npm:

```bash
npm install trix.db
```

## Usage
To use the Trix Database package, require it in your Node.js application:

```javascript
const Database = require('trix.db');
```

Then, create a new instance of the `Database` class:

```javascript
const db = new Database();
```

## Commands

### MongoDBDriver Commands

1. `connectToMongoDB(url, dbName)`: Connects to a MongoDB server with the provided URL and database name.
2. `insertOne(collectionName, document)`: Inserts a document into the specified MongoDB collection.
3. `findOne(collectionName, query)`: Finds a document in the specified MongoDB collection based on the query.
4. `updateOne(collectionName, filter, update)`: Updates a document in the specified MongoDB collection based on the filter.
5. `deleteOne(collectionName, filter)`: Deletes a document from the specified MongoDB collection based on the filter.
6. `init(table)`: Initializes the database for MongoDB operations with the specified table name.
7. `setRowByKey(table, key, value)`: Sets a row in the MongoDB table with the specified key and value.
8. `getAllRows(table)`: Retrieves all rows from the MongoDB table.
9. `getRowByKey(table, key)`: Retrieves a row from the MongoDB table based on the specified key.
10. `deleteRowByKey(table, key)`: Deletes a row from the MongoDB table based on the specified key.
11. `deleteAllRows(table)`: Deletes all rows from the MongoDB table.
12. `disconnect()`: Disconnects from the MongoDB server.

### CacheDriver Commands

1. `enableCache()`: Enables caching of data.
2. `disableCache()`: Disables caching of data.

### Regular Commands (Not specific to MongoDBDriver or CacheDriver)

1. `set(key, value)`: Sets a key-value pair in the database.
2. `get(key)`: Retrieves the value associated with the given key.
3. `delete(key)`: Deletes the key-value pair with the specified key.
4. `add(key, num)`: Adds a numeric value to the existing value of the specified key.
5. `subtract(key, num)`: Subtracts a numeric value from the existing value of the specified key.
6. `push(key, item)`: Appends an item to an array stored at the specified key.
7. `math(key, operator, num)`: Performs basic arithmetic operations (+, -, *, /) on the value associated with the given key.
8. `enableEncryption()`: Enables data encryption.
9. `disableEncryption()`: Disables data encryption.
10. `fetch()`: Retrieves all data from the database, including cached data if caching is enabled.
11. `fetchAll()`: Retrieves all data from the database, including cached data if caching is enabled.
12. `all()`: Retrieves all data from the database, excluding cached data.
13. `backup(filename)`: Creates a backup of the database in a JSON file with the specified filename.
14. `reset()`: Resets the database by clearing all data.
15. `connect()`: Connects to the MongoDB server. (Also available in MongoDBDriver)
16. `close()`: Closes the database connection. (Also available in MongoDBDriver)

### New Commands

#### SQLite3 Commands

1. `connectToSQLite(filename)`: Connects to an SQLite database file.
2. `runSQLiteQuery(query)`: Runs a query on the connected SQLite database.
3. `disconnectFromSQLite()`: Disconnects from the SQLite database.

#### PostgreSQL Commands

1. `connectToPostgreSQL(config)`: Connects to a PostgreSQL database with the provided configuration.
2. `runPostgreSQLQuery(query)`: Runs a query on the connected PostgreSQL database.
3. `disconnectFromPostgreSQL()`: Disconnects from the PostgreSQL database.

### Encryption
You can enable or disable encryption using the `enableEncryption()` and `disableEncryption()` methods. By default, encryption is enabled.

### MongoDBDriver
The MongoDBDriver feature allows seamless integration with MongoDB databases. You can connect to a MongoDB server, perform CRUD operations, and manage database collections effortlessly.

Example:

```javascript
// Connect to MongoDB
await db.connectToMongoDB('mongodb://localhost:27017', 'myDatabase');

// Insert a document
await db.insertOne('users', { name: 'Trix', age: 30 });

// Find a document
const user = await db.findOne('users', { name: 'Trix' });

// Disconnect from MongoDB
await db.disconnect();
```

### SQLite3 Commands

1. `connectToSQLite(filename)`: Connects to an SQLite database file.
2. `runSQLiteQuery(query)`: Runs a query on the connected SQLite database.
3. `disconnectFromSQLite()`: Disconnects from the SQLite database.

### PostgreSQL Commands

1. `connectToPostgreSQL(config)`: Connects to a PostgreSQL database with the provided configuration.
2. `runPostgreSQLQuery(query)`: Runs a query on the connected PostgreSQL database.
3. `disconnectFromPostgreSQL()`: Disconnects from the PostgreSQL database.

...

### New Improvements

#### Error Handling

Both SQLite3 and PostgreSQL functions now utilize try/catch blocks to properly handle errors and log them appropriately.

#### Logging Events

Improved logging with `this.log` method to provide detailed messages about the operations performed.

#### PostgreSQL Specific Improvements

- **Promise-based Execution**: PostgreSQL functions now utilize Promises for better response management and to ensure proper handling of resolve or reject calls.

- **Returning Inserted Data**: Modified PostgreSQL `insertPostgreSQL` function to use `RETURNING *` in the query to retrieve the entire record that was inserted.

#### SQLite3 Specific Improvements

- **Promise-based Execution**: SQLite3 function `findOneSQLite` now returns a Promise for better control flow and error handling.

- **Error Handling**: Enhanced SQLite3 functions to handle errors more robustly using try/catch blocks and logging detailed error messages.

**These improvements ensure smoother operation and better error handling in both SQLite3 and PostgreSQL environments when using Trix Database for website development.**


### CacheDriver
The CacheDriver feature improves performance by caching data in memory. You can enable or disable caching using the `enableCache()` and `disableCache()` methods.

Example:

```javascript
// Enable caching
db.enableCache();

// Disable caching
db.disableCache();
```

### Discord Bot Example

```javascript
const { Client, Intents } = require('discord.js');
const Database = require('trix.db');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const db = new Database();
db.disableEncryption();
const leaderboard = new Map();

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', message => {
    if (!message.author.bot) {
        if (message.content.toLowerCase() === '!balance') {
            const balance = db.get(`balance_${message.author.id}`) || 0;
            message.channel.send(`Your balance is: ${balance}`);
        }
        else if (message.content.toLowerCase().startsWith('!addmoney')) {
            const args = message.content.split(' ');
            const amount = parseInt(args[1]);
            if (!isNaN(amount)) {
                db.set(`balance_${message.author.id}`, amount);
                message.channel.send(`Added ${amount} to your balance.`);
            } else {
                message.channel.send('Invalid amount. Usage: !addmoney [amount]');
            }
        }
        else if (message.content.toLowerCase() === '!leaderboard') {
            const leaderboardData = db.all(); 
            const sortedLeaderboard = Object.entries(leaderboardData)
                .filter(([key]) => key.startsWith('balance_'))
                .sort(([, balanceA], [, balanceB]) => balanceB - balanceA) 
                .slice(0, 5); 
        
            const leaderboardEmbed = new MessageEmbed()
                .setTitle('Leaderboard')
                .setColor('#0099ff')
                .setDescription('Here are the top 5 users on the leaderboard:')
                .addFields(
                    sortedLeaderboard.map(([key, balance], position) => ({
                        name: `#${position + 1}`,
                        value: `<@${key.split('_')[1]}>: ${balance}`,
                        inline: true
                    }))
                );
        
            message.channel.send({ embeds: [leaderboardEmbed] });
        }
    }
});

client.login('YOUR_BOT_TOKEN');
```

### Examples

#### Using Trix Database in Website Backend Design (Node.js)

Here's an example of setting up a basic web server using Express.js and connecting it to a PostgreSQL database using Trix Database:

```javascript
// app.js

const express = require('express');
const { Client } = require('pg');
const Database = require('trix.db');

const app = express();
const port = 3000;

// PostgreSQL configuration
const pgConfig = {
    user: 'your_username',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_password',
    port: 5432,
};

// Initialize Trix Database instance
const db = new Database();

// Connect to PostgreSQL database
db.connectToPostgreSQL(pgConfig);

// Middleware for JSON parsing
app.use(express.json());

// Example route: Get all users
app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM users';
        const result = await db.runPostgreSQLQuery(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Example route: Add a new user
app.post('/users', async (req, res) => {
    const { username, email } = req.body;
    try {
        const query = `INSERT INTO users (username, email) VALUES ('${username}', '${email}')`;
        await db.runPostgreSQLQuery(query);
        res.json({ message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```

This example demonstrates how to use Trix Database to handle database operations in a web application backend using Node.js, Express.js, and PostgreSQL.

## 🎉 🥳 **Updates**

### 1. **Enhanced Encryption and Decryption**

#### **Encryption**
Enhanced encryption capabilities to support additional algorithms like AES-128-CBC and AES-192-CBC. Encryption is enabled by default.

To enable encryption:
```javascript
const database = new Database({
    encrypt: true, // Enable encryption
});
```

#### **Decryption**
Added functions to decrypt encrypted data.

To disable encryption:
```javascript
const database = new Database({
    encrypt: false, // Disable encryption
});
```

### 2. **Advanced Logging System**

#### **Commands**

1. `initLogs()`: Initializes the logging system.
2. `createLogStream(filename)`: Creates a new log file with the specified filename.
3. `log(message, filename)`: Logs a message to the specified log file. The default filename is 'default'.
4. `enableLogs()`: Enables logging functionality.
5. `disableLogs()`: Disables logging functionality.

#### **Usage**

To **enable logging**:
```javascript
// Enable logging
database.enableLogs(); // Enable logging
```

To **disable logging**:
```javascript
database.disableLogs(); // Disable logging
```

**To log a message**:
```javascript
database.log('Message to log', 'customLog.log'); // Logs a message to customLog.log
```

### **Conclusion**
These updates significantly enhance the functionality of the Trix Database package by introducing advanced encryption options and an improved logging system. These additions provide greater flexibility and security when managing data and handling logs.

### **Programmer Information**
- Programmer: **Sir.Witty**
- GitHub: [GitHub Profile](https://github.com/SrWitty)
- Discord: [Discord Profile](https://discord.com/users/1091118468155314306)

---
