import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DatabaseService } from '../services/database.service';

import NERMModel from '../models/nerm.model';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit, OnDestroy {
  user: Object;
  project: NERMModel = new NERMModel();

  getProjectSubscribe: any;

  constructor(
    private router: Router,
    public databaseService: DatabaseService,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.project.projectName = decodeURI(this.router.url.split("/")[1]);
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
        console.log(this.user['email'])
        console.log(this.project.projectName)
        console.log(data)
      })
    })
  }

}
