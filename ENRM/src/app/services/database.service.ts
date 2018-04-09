import NERM from '../models/nerm.model';
import { appConfig } from '../app.config';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Response, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

//RxJS operator for mapping the observable
import 'rxjs/add/operator/map';

const nermUrl = `${appConfig.apiUrl}/api/nerms`;

@Injectable()
export class DatabaseService {

  constructor(
    private http: HttpClient
  ) {
  }

  //Create nerm, takes a NERM Object
  createNERM(nerm: NERM): Observable<any> {
    //returns the observable of http post request 
    return this.http.post(`${nermUrl}`, nerm);
  }

  //Read nerm, takes no arguments
  getNERMs(): Observable<NERM[]> {
    return this.http.get(nermUrl)
      .map((res) => {
        //Maps the response object sent from the server
        return res["data"].docs as NERM[];
      })
  }
  //Update nerm, takes a NERM Object as parameter
  updateNERM(nerm: NERM): Observable<any> {
    //returns the observable of http put request 
    return this.http.put(`${nermUrl}`, nerm);
  }

  deleteNERM(id: string): any {
    //Delete the object by the id
    let deleteUrl = `${nermUrl}/${id}`
    return this.http.delete(deleteUrl)
      .map(res => {
        return res;
      })
  }

  //Default Error handling method.
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
