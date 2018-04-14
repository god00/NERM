import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { CreateModelComponent } from './create-model/create-model.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  user: Object;

  constructor(public router: Router) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    // this.addPathModel();
  }

  ngOnDestroy() {

  }

  addPathModel() {

    this.router.config.unshift({ path: '', component: CreateModelComponent })
  }

}
