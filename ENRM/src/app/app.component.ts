import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DatabaseService } from './services/database.service';

import { CreateModelComponent } from './create-model/create-model.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  user: Object;

  getModelSubscribe: any;

  constructor(
    public router: Router,
    public databaseService: DatabaseService
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.user) {
      this.getModelSubscribe = this.databaseService.getModels(this.user['email']).subscribe((modelsByUser) => {
        if (modelsByUser) {
          this.addPathModel(modelsByUser);
        }
      })
    }
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.getModelSubscribe.unsubscribe();
  }

  addPathModel(modelsByUser: any) {
    for (let model of modelsByUser) {
      this.router.config.unshift({ path: model.ModelName, component: CreateModelComponent })
    }
  }

}
