import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.user = localStorage.getItem('currentUser')
    console.log(this.user['email'])
    console.log(this.user['token'])
  }

  createModal() {
    this.router.navigate(['create']);
  }

}
