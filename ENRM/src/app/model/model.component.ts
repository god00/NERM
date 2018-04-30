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
  modelName: string;

  getProjectSubscribe: any;
  updateProjectSubscribe: any;

  intervalId: any;
  constructor(
    private router: Router,
    public databaseService: DatabaseService,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.project.projectName = decodeURI(this.router.url.split("/")[1]);
    this.modelName = decodeURI(this.router.url.split("/")[2]);
    this.project.email = this.user['email'];
  }

  ngOnInit() {
    this.getProject();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
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
    if (this.updateProjectSubscribe) {
      this.updateProjectSubscribe.unsubscribe();
    }
    clearInterval(this.intervalId);
  }

  getProject() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProject(this.user['email'], encodeURI(<string>this.project.projectName)).subscribe((data) => {
        if (data) {
          this.project = data['project'];
          let index = this.project.model.indexOf(this.modelName);
          if (index != -1) {
            console.log(data['project'].corpusInfo)
            this.project.corpusInfo = data['project'].corpusInfo[index]
          }
        }
        console.log(data)
      })
    })
  }

  goToCreateModel() {
    this.project.summitPreProcessing = false;
    if (this.updateProjectSubscribe) {
      this.updateProjectSubscribe.unsubscribe();
    }
    this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
      if (res) {
        this.router.navigate([`${this.project.projectName}/create/model`]);
      }
    });

  }

}
