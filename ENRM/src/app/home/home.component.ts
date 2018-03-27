import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { debounceTime } from 'rxjs/operator/debounceTime';
import { Subject } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  Model: string;
  user: Object;

  //Alert parameter
  private _success = new Subject<string>();
  alertMessage: string;
  successLogin: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authenicationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));

    this._success.subscribe((message) => {
      this.alertMessage = message;
    });
    debounceTime.call(this._success, 3000).subscribe(() => {
      this.alertMessage = null;
      this.successLogin = null;
    });
    if (this.user) {
      this.successLogin = true;
      this._success.next(`${new Date()} - Succesfully Login.`);
    }
  }

  createModal() {
    this.router.navigate(['create']);
  }

  logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}
