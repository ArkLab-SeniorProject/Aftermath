import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

export function toObjectId(value: string): ObjectId {
  return new ObjectId(value);
}

export function collection(db: Db, name: string) {
  return db.collection(name);
}

export function mapId(doc: any) {
  if (!doc) return null;
  return { ...doc, id: String(doc._id) };
}
