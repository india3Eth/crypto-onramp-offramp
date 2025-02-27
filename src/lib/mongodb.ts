import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let db: Db

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export { clientPromise }

// Helper function to get database instance
export async function getDb() {
  if (!db) {
    const client = await clientPromise
    db = client.db(process.env.MONGODB_DB_NAME || 'crypto-exchange')
  }
  return db
}

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  CONFIG: 'config',
  QUOTES: 'quotes',
  TRANSACTIONS: 'transactions',
}