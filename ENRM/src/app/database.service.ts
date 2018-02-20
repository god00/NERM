import { Injectable } from '@angular/core'

import mysql = require('mysql')
import fs = require('fs');
import stream = require('stream');

import * as mysqlConfig from './mysql.config'

@Injectable()
export class DatabaseService {
  public con;
  config;


  constructor(
  ) {
    this.config = mysqlConfig.config
    this.con = mysql.createConnection(this.config)
    console.log(this.con)
  }

  dbConnection() {
      this.con.connect();
  }

  dbDisconnection() {
    if (this.con) {
      this.con.end((err) => {
      });
    }
  }

  readDBFromTable(table: string) {
    this.con.query(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) throw err;

      console.log('Data received from Db:\n');
      console.log(rows);
    });
  }
}
