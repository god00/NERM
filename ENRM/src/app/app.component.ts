import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DatabaseService } from './services/database.service';
import { AuthenticationService } from './services/authentication.service';

import { CreateModelComponent } from './create-model/create-model.component';
import { ModelListComponent } from './model-list/model-list.component';
import { ModelComponent } from './model/model.component';

import NERMModel from './models/nerm.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  intervalId: any;
  user: Object;
  projectsByUser: NERMModel[] = [];
  getModelSubscribe: any;

  constructor(
    public router: Router,
    public databaseService: DatabaseService,
    public authenicationService: AuthenticationService
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.user) {
      this.getModelSubscribe = this.databaseService.getProjects(this.user['email']).subscribe((projectsByUser) => {
        if (projectsByUser) {
          this.projectsByUser = projectsByUser;
          this.addPathModel(projectsByUser);
          console.log(this.projectsByUser)
        }
      })
    }
    else {
      this.setIntervalGetUser()
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.getModelSubscribe) {
      this.getModelSubscribe.unsubscribe();
    }
    if (this.intervalId)
      clearInterval(this.intervalId);
  }

  setIntervalGetUser() {
    if (this.intervalId)
      clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.getModelSubscribe) {
        this.getModelSubscribe.unsubscribe();
      }
      this.user = JSON.parse(localStorage.getItem('currentUser'));
      if (this.user) {
        this.getModelSubscribe = this.databaseService.getProjects(this.user['email']).subscribe((projectsByUser) => {
          if (projectsByUser) {
            this.projectsByUser = projectsByUser;
            this.addPathModel(projectsByUser);
            if (this.intervalId)
              clearInterval(this.intervalId);
          }
        })
      }
    }, 3500)
  }

  updateNavBar() {
    this.getModelSubscribe = this.databaseService.getProjects(this.user['email']).subscribe((projectsByUser) => {
      if (projectsByUser) {
        this.projectsByUser = projectsByUser;
        if (this.getModelSubscribe) {
          this.getModelSubscribe.unsubscribe();
        }
      }
    })
  }

  addPathModel(projectsByUser: any) {
    for (let project of projectsByUser) {
      this.router.config.unshift({ path: `${project.projectName}/create/model`, component: CreateModelComponent })
      this.router.config.unshift({ path: project.projectName, component: ModelListComponent })
      for (let model of project.model) {
        if (model) {
          let routerPath = encodeURI(`${project.projectName}/${model}`);
          this.router.config.unshift({ path: routerPath, component: ModelComponent })
        }
      }
    }
  }

  public logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}
