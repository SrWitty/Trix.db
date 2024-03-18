## Trix Database Package

### Overview
Trix Database is a powerful Node.js package for managing data with built-in support for encryption, MongoDB integration, and caching. It provides an intuitive interface for storing, retrieving, and manipulating data efficiently.

### Installation
You can install the Trix Database package via npm:

```bash
npm install trix.db
```

### Usage
To use the Trix Database package, require it in your Node.js application:

```javascript
const Database = require('trix.db');
```

Then, create a new instance of the `Database` class:

```javascript
const db = new Database();
```

### Commands

#### MongoDBDriver Commands

1. `connectToMongoDB(url, dbName)`: Connects to a MongoDB server with the provided URL and database name. <br>
2. `insertOne(collectionName, document)`: Inserts a document into the specified MongoDB collection. <br>
3. `findOne(collectionName, query)`: Finds a document in the specified MongoDB collection based on the query. <br>
4. `updateOne(collectionName, filter, update)`: Updates a document in the specified MongoDB collection based on the filter. <br>
5. `deleteOne(collectionName, filter)`: Deletes a document from the specified MongoDB collection based on the filter. <br>
6. `init(table)`: Initializes the database for MongoDB operations with the specified table name. <br>
7. `setRowByKey(table, key, value)`: Sets a row in the MongoDB table with the specified key and value. <br>
8. `getAllRows(table)`: Retrieves all rows from the MongoDB table. <br>
9. `getRowByKey(table, key)`: Retrieves a row from the MongoDB table based on the specified key. <br>
10. `deleteRowByKey(table, key)`: Deletes a row from the MongoDB table based on the specified key. <br>
11. `deleteAllRows(table)`: Deletes all rows from the MongoDB table. <br>
12. `disconnect()`: Disconnects from the MongoDB server. <br>

#### CacheDriver Commands

1. `enableCache()`: Enables caching of data. <br>
2. `disableCache()`: Disables caching of data.

#### Regular Commands (Not specific to MongoDBDriver or CacheDriver)

1. `set(key, value)`: Sets a key-value pair in the database. <br>
2. `get(key)`: Retrieves the value associated with the given key. <br>
3. `delete(key)`: Deletes the key-value pair with the specified key. <br>
4. `add(key, num)`: Adds a numeric value to the existing value of the specified key. <br>
5. `subtract(key, num)`: Subtracts a numeric value from the existing value of the specified key. <br>
6. `push(key, item)`: Appends an item to an array stored at the specified key. <br>
7. `math(key, operator, num)`: Performs basic arithmetic operations (+, -, *, /) on the value associated with the given key. <br>
8. `enableEncryption()`: Enables data encryption. <br>
9. `disableEncryption()`: Disables data encryption. <br>
10. `fetch()`: Retrieves all data from the database, including cached data if caching is enabled. <br>
11. `fetchAll()`: Retrieves all data from the database, including cached data if caching is enabled. <br>
12. `all()`: Retrieves all data from the database, excluding cached data. <br>
13. `backup(filename)`: Creates a backup of the database in a JSON file with the specified filename. <br>
14. `reset()`: Resets the database by clearing all data. <br>
15. `connect()`: Connects to the MongoDB server. (Also available in MongoDBDriver) <br>
16. `close()`: Closes the database connection. (Also available in MongoDBDriver) 

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

### CacheDriver
The CacheDriver feature improves performance by caching data in memory. You can enable or disable caching using the `enableCache()` and `disableCache()` methods.

Example:

```javascript
// Enable caching
db.enableCache();

// Disable caching
db.disableCache();
```

### Discord Bot Example :

```javascript
const { Client, Intents } = require('discord.js');
const Database = require('trix.db');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const db = new Database();
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
                db.add(`balance_${message.author.id}`, amount);
                message.channel.send(`Added ${amount} to your balance.`);
            } else {
                message.channel.send('Invalid amount. Usage: !addmoney [amount]');
            }
        }
        else if (message.content.toLowerCase() === '!leaderboard') {
            const sortedLeaderboard = [...leaderboard.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            let leaderboardMessage = '**Leaderboard:**\n';
            sortedLeaderboard.forEach(([userId, balance], position) => {
                leaderboardMessage += `${position + 1}. <@${userId}>: ${balance}\n`;
            });

            message.channel.send(leaderboardMessage);
        }
    }
});


client.login('YOUR_BOT_TOKEN');
```

### The Small Update

1. Fix Don't Make Database Json File

2. Add Discord Bot Example For Package 


### Conclusion
The Trix Database package offers a robust solution for data management in Node.js applications. With its encryption, MongoDB integration, and caching capabilities, it provides flexibility, security, and performance for handling various data storage requirements.

### Programmer Information
- Programmer: [iim7md11]
- GitHub: [[GitHub Profile](https://github.com/iim7md11)]
- Discord: [[Discord Profile ](https://discord.com/users/1091118468155314306)]
