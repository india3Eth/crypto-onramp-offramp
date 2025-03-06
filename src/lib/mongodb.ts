import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb'

// MongoDB connection URI
const uri = process.env.MONGODB_URI || '';
if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Database name
const dbName = process.env.MONGODB_DB_NAME || 'crypto-exchange';

// MongoDB client options with sensible defaults for connection pooling
const options: MongoClientOptions = {
  maxPoolSize: 10, // Default is 10, adjust based on your needs
  minPoolSize: 1,
  socketTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  retryWrites: true,
  retryReads: true,
};

// Connection caching for development
interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoDb?: Db;
}

// Add the MongoDB client promise to the global object
declare global {
  var _mongoClient: GlobalMongo;
}

// Initialize or reuse global connection object
global._mongoClient = global._mongoClient || {};

let clientPromise: Promise<MongoClient>;
let cachedDb: Db | null = null;

// In development, use a global connection to avoid multiple connections during hot reloading
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClient._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB connected in development mode');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB in development mode:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClient._mongoClientPromise;
} else {
  // In production mode, create a new client for each connection
  const client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB connected in production mode');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB in production mode:', err);
      throw err;
    });
}

/**
 * Get database connection
 */
export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Unable to connect to database');
  }
}

/**
 * Get a typed collection from the database
 */
export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

// Export client promise for external usage
export { clientPromise };

// Collection names to prevent string typos
export const COLLECTIONS = {
  USERS: 'users',
  COUNTRIES: 'countries',
  PAYMENTS: 'payments',
  CRYPTO: 'crypto',
  TRANSACTIONS: 'transactions',
  QUOTES: 'quotes',
  LOGS: 'logs',
  SETTINGS: 'settings',
};

// Typed collection getters
export async function getUsersCollection() {
  return getCollection(COLLECTIONS.USERS);
}

export async function getCountriesCollection() {
  return getCollection(COLLECTIONS.COUNTRIES);
}

export async function getPaymentsCollection() {
  return getCollection(COLLECTIONS.PAYMENTS);
}

export async function getCryptoCollection() {
  return getCollection(COLLECTIONS.CRYPTO);
}

export async function getTransactionsCollection() {
  return getCollection(COLLECTIONS.TRANSACTIONS);
}

export async function getQuotesCollection() {
  return getCollection(COLLECTIONS.QUOTES);
}

export async function getLogsCollection() {
  return getCollection(COLLECTIONS.LOGS);
}

export async function getSettingsCollection() {
  return getCollection(COLLECTIONS.SETTINGS);
}