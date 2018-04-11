import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { appConfig } from '../app.config';


// const URL = '/api/';
const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Injectable()
export class FileUploadService {


    constructor(private http: HttpClient) {
    }

    uploadNERM(formData: FormData): Observable<any> {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');

        return this.http.post(`${nermUrl}`, formData, { headers: headers });
    }
}