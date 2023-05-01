import { Collection, Db, MongoClient } from 'mongodb';
import { infoln, successln } from './utils.js';

const url = 'mongodb://localhost:27017';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<void> {
    infoln('\nAttempting connection to the database');
    client = await MongoClient.connect(url);
    db = client.db('coidsdb');
    successln('Successfully connected to the database!');
}

export function getCollection(name: string): Collection {
    const collection = db.collection(name);
    return collection;
}
