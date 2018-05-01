import NERM from '../models/nermUser.model';
import NERMModel from '../models/nerm.model';
import { appConfig } from '../app.config';

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

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
  createProject(nerm: NERMModel): Observable<any> {
    //returns the observable of http post request 
    return this.http.post(`${nermUrl}/project`, nerm);
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

  getProjects(email: string): Observable<NERMModel[]> {
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
    return this.http.put(`${nermUrl}/project`, nerm);
  }

  genarateDictList(id: string): Observable<any> {
    return this.http.post(`${nermUrl}/dictionary`, { id });
  }

  testModel(email: String, projectName: String, modelname: string): Observable<any> {
    return this.http.post(`${nermUrl}/testmodel`, { email, projectName, modelname })
      .map((res) => {
        if (res != undefined) {
          return res["data"];
        } else {
          return res;
        }
      });;
  }

  genarateTemplate(id: string): Observable<any> {
    return this.http.post(`${nermUrl}/templates`, { id });
  }

  createModel(id: string, modelname: string): Observable<any> {
    return this.http.post(`${nermUrl}/model`, { id, modelname });
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

  deleteTestData(id: string, fileName: string): any {
    //Delete the object by the id
    let deleteUrl = `${nermUrl}/testdata/${id}`
    return this.http.delete(deleteUrl, { params: { fileName } })
      .map(res => {
        return res;
      })
  }

  getProject(email: string, projectName: string): Observable<Object> {
    return this.http.get(`${nermUrl}/project`, {
      params: {
        email: email,
        projectName: projectName
      }
    }).map((res) => {
      if (res != undefined) {
        //Maps the response object sent from the server
        return res["data"];
      }
      else {
        return res
      }
    })
  }

  getTestData(email: string, projectName: string, modelname: string): Observable<Object> {
    return this.http.get(`${nermUrl}/testdata`, {
      params: {
        email: email,
        projectName: projectName,
        modelname: modelname
      }
    }).map((res) => {
      if (res != undefined) {
        //Maps the response object sent from the server
        return res["data"];
      }
      else {
        return res
      }
    })
  }

  downloadModel(email: string, projectName: string, modelname: string): Observable<Object> {
    let httpOptions = {
      params: {
        email: email,
        projectName: projectName,
        modelname: modelname
      }
    }
    return this.http.get(`${nermUrl}/download`, httpOptions);
  }

  //Default Error handling method.
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
