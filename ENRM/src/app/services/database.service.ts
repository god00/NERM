import NERM from '../models/nermUser.model';
import NERMModel from '../models/nerm.model';
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
  createUser(nerm: NERM): Observable<any> {
    //returns the observable of http post request 
    return this.http.post(`${nermUrl}`, nerm);
  }

  //Create model, takes a NERMModel Object
  createModel(nerm: NERMModel): Observable<any> {
    //returns the observable of http post request 
    return this.http.post(`${nermUrl}/model`, nerm);
  }

  //Read nerm, takes no arguments
  getUsers(): Observable<NERM[]> {
    return this.http.get(nermUrl, {
      params: {
        collections: 'users'
      }
    }).map((res) => {
      //Maps the response object sent from the server
      return res["data"] as NERM[];
    })
  }

  getModels(email: string): Observable<NERMModel[]> {
    return this.http.get(`${nermUrl}/`, {
      params: {
        email: email,
        collections: 'nerms'
      }
    }).map((res) => {
      //Maps the response object sent from the server
      return res["data"] as NERMModel[];
    })
  }

  //Update nerm, takes a NERMModel Object as parameter
  updateNERM(nerm: NERMModel): Observable<any> {
    //returns the observable of http put request 
    return this.http.put(`${nermUrl}/model`, nerm);
  }

  deleteNERM(id: string): any {
    //Delete the object by the id
    let deleteUrl = `${nermUrl}/${id}`
    return this.http.delete(deleteUrl)
      .map(res => {
        return res;
      })
  }

  deleteCorpus(id: string, fileName: string): any {
    //Delete the object by the id
    let deleteUrl = `${nermUrl}/corpus/${id}`
    return this.http.delete(deleteUrl, { params: { fileName } })
      .map(res => {
        return res;
      })
  }

  getModel(email: string, modelName: string): Observable<NERMModel> {
    return this.http.get(`${nermUrl}/model`, {
      params: {
        email: email,
        modelName: modelName
      }
    }).map((res) => {
      //Maps the response object sent from the server
      return res["data"] as NERMModel;
    })
  }

  //Default Error handling method.
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
