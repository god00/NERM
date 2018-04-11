import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { appConfig } from '../app.config';


// const URL = '/api/';
const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Injectable()
export class FileUploadService {


    constructor(private http: HttpClient) {
    }

    uploadNERM(formData: FormData): Observable<any> {
        return this.http.post(`${nermUrl}`, formData);
    }
}