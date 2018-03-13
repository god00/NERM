import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  Model: string;
  user: Object;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authenicationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
  }

  createModal() {
    this.router.navigate(['create']);
  }

  logout(){
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}
