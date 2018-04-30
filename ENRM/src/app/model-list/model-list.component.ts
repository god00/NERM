import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DatabaseService } from '../services/database.service';

import NERMModel from '../models/nerm.model';


@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.css']
})
export class ModelListComponent implements OnInit, OnDestroy {
  user: Object;
  project: NERMModel = new NERMModel();

  getProjectSubscribe: any;

  constructor(
    private router: Router,
    public databaseService: DatabaseService,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.project.projectName = decodeURI(this.router.url.slice(1, this.router.url.length));
    this.project.email = this.user['email'];
  }

  ngOnInit() {
    this.getProject();
    setInterval(() => {
      if (this.getProjectSubscribe) {
        this.getProjectSubscribe.unsubscribe();
      }
      this.getProject();
    }, 5000)
  }

  ngOnDestroy() {
    if (this.getProjectSubscribe) {
      this.getProjectSubscribe.unsubscribe();
    }
  }

  getProject() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProject(this.user['email'], encodeURI(<string>this.project.projectName)).subscribe((data) => {
        if (data) {
          this.project.model = data['project'].model;   // string[] of ModelName
          this.project.isTraining = data['project'].isTraining;
        }
      })
    })
  }

  goToCreateModel() {
    this.router.navigate([`${this.project.projectName}/create/model`]);
  }
}
