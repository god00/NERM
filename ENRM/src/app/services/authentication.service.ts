import NERM from '../models/nermUser.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { appConfig } from '../app.config';

@Injectable()
export class AuthenticationService {

    nermUrl = `${appConfig.apiUrl}/api/nerms`;

    constructor(private http: HttpClient) { }

    loginNERM(user: NERM, rememberLogin: boolean): Observable<any> {
        return this.http.post<any>(`${this.nermUrl}/login`, user)
            .map(res => {
                // login successful if there's a jwt token in the response
                if (res.data && res.data.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(res.data));
                }
                return res;
            });
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}