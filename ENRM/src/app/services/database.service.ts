import NERM from '../models/nerm.model'
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Response } from '@angular/http';
import { Injectable } from '@angular/core'

//RxJS operator for mapping the observable
import 'rxjs/add/operator/map';

@Injectable()
export class DatabaseService {

  api_url = 'http://158.108.34.72:3000';
  nermUrl = `${this.api_url}/api/nerms`;

  constructor(
    private http: HttpClient
  ) {
  }

  //Create nerm, takes a NERM Object
  createNERM(nerm: NERM): Observable<any>{
    //returns the observable of http post request 
    return this.http.post(`${this.nermUrl}`, nerm);
  }

  //Read nerm, takes no arguments
  getNERMs(): Observable<NERM[]>{
    return this.http.get(this.nermUrl)
    .map((res)  => {
      //Maps the response object sent from the server
      console.log(res);
      return res["data"].docs as NERM[];
    })
  }
  //Update nerm, takes a NERM Object as parameter
  editNERM(nerm:NERM){
    let editUrl = `${this.nermUrl}`
    //returns the observable of http put request 
    return this.http.put(editUrl, nerm);
  }

  deleteNERM(id:string):any{
    //Delete the object by the id
    let deleteUrl = `${this.nermUrl}/${id}`
    return this.http.delete(deleteUrl)
    .map(res  => {
      return res;
    })
  }

  //Default Error handling method.
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }


}
