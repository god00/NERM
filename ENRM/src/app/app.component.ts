import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DatabaseService } from './services/database.service';

import { CreateModelComponent } from './create-model/create-model.component';
import { ModelListComponent } from './model-list/model-list.component';
import { ModelComponent } from './model/model.component';

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
      this.getModelSubscribe = this.databaseService.getProjects(this.user['email']).subscribe((projectsByUser) => {
        if (projectsByUser) {
          this.addPathModel(projectsByUser);
        }
      })
    }
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.getModelSubscribe.unsubscribe();
  }

  addPathModel(projectsByUser: any) {
    for (let project of projectsByUser) {
      if (project.model.length == 0) {
        this.router.config.unshift({ path: project.projectName, component: CreateModelComponent })
      }
      else {
        this.router.config.unshift({ path: project.projectName, component: ModelListComponent })
        for (let model of project.model) {
          let routerPath = `${project.projectName}/${model}`
          this.router.config.unshift({ path: routerPath, component: ModelComponent })
        }

      }
    }
  }

}
