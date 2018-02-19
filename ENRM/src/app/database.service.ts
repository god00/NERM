import { Injectable } from '@angular/core';
import { MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService {
  host = 'localhost';
  port = 27017;
  database = 'NERM';

  constructor(
    public mongoClient : MongoClient
  ) { }

  dbConnection() {
    return new Promise((resolve, reject) => {
      this.mongoClient.connect(`mongodb://${this.host}:${this.port}/${this.database}`,
      (err, db) => {
        err ? reject(err) : resolve(db);
      });
    });
  }

}
