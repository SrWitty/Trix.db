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

#### CacheDriver Commands

1. `enableCache()`: Enables caching of data.
2. `disableCache()`: Disables caching of data.

#### Regular Commands (Not specific to MongoDBDriver or CacheDriver)

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

### Conclusion
The Trix Database package offers a robust solution for data management in Node.js applications. With its encryption, MongoDB integration, and caching capabilities, it provides flexibility, security, and performance for handling various data storage requirements.

### Programmer Information
- Programmer: [iim7md11]
- GitHub: [[GitHub Profile](https://github.com/iim7md11)]
- Discord: [[Discord Profile ](https://discord.com/users/1091118468155314306)]
