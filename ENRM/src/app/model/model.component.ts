import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { FileUploader, FileItem } from 'ng2-file-upload';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { appConfig } from '../app.config';
import { DatabaseService } from '../services/database.service';

import NERMModel from '../models/nerm.model';

const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit, OnDestroy {
  user: Object;
  project: NERMModel = new NERMModel();
  modelName: string;

  // upload parameter
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  hasError: boolean = false;
  deleteTestDataName: string = '';

  getProjectSubscribe: any;
  updateProjectSubscribe: any;

  intervalId: any;
  constructor(
    private router: Router,
    public databaseService: DatabaseService,
    private modalService: NgbModal,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.project.projectName = decodeURI(this.router.url.split("/")[1]);
    this.modelName = decodeURI(this.router.url.split("/")[2]);
    this.project.email = this.user['email'];
  }

  ngOnInit() {
    this.getProject().then(() => {
      if (this.project.isTraining && this.project.model[this.project.model.length - 1] == this.modelName) {
        this.intervalId = setInterval(() => {
          if (this.getProjectSubscribe) {
            this.getProjectSubscribe.unsubscribe();
          }
          this.getProject().then(() => {
            if (!this.project.isTraining) {
              this.getCorpusInfo();
              if (this.intervalId)
                clearInterval(this.intervalId);
            }
          });
        }, 3500)
      }
      else {
        this.getCorpusInfo();
      }
    });
  }

  ngOnDestroy() {
    if (this.getProjectSubscribe) {
      this.getProjectSubscribe.unsubscribe();
    }
    if (this.updateProjectSubscribe) {
      this.updateProjectSubscribe.unsubscribe();
    }
    if (this.intervalId)
      clearInterval(this.intervalId);
  }

  getProject() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProject(this.user['email'], encodeURI(<string>this.project.projectName)).subscribe((data) => {
        if (data) {
          this.project = data['project'];
        }
        else {
          console.log('No model');
          this.router.navigate(['']);
        }
        resolve();
      })
    })
  }

  getCorpusInfo() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProjectWithModelName(this.user['email'], encodeURI(<string>this.project.projectName), this.modelName).subscribe((data) => {
        if (data) {
          let index = this.project.model.indexOf(this.modelName);
          if (index != -1) {
            this.project.corpusInfo = data['project'].corpusInfo[index]
          }
        }
        else {
          console.log('No model');
          this.router.navigate(['']);
        }
        resolve();
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

  uploadModal(content, mode) {
    let count = 0;
    this.uploader = new FileUploader({ url: nermUrl });
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('projectName', this.project.projectName);
      form.append('mode', mode);
      form.append('modelname', this.modelName);
      form.append('indexTestData', this.project.model.indexOf(this.modelName));
      return { fileItem, form }
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      count = 0;
      this.hasError = item.isError;
      if (this.getProjectSubscribe)
        this.getProjectSubscribe.unsubscribe();
      this.getProject().then(() => {
      });
    };
    this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
      // console.log("fail:", item, status);
      if (count == 0) {
        this.uploader.uploadItem(item);
        count++;
      }
      this.hasError = item.isError;
    };
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  openConfirmModal(content, index) {
    this.deleteTestDataName = this.project.testData[this.modelName][index]['fileName'];
    this.modalService.open(content, { centered: true, size: 'sm' }).result.then((result) => {
      this.deleteTestDataName = '';
    }, (reason) => {
      this.deleteTestDataName = '';
    });
  }

  deleteTestData() {
    if (this.deleteTestDataName != '') {
      this.databaseService.deleteTestData(this.project._id, this.deleteTestDataName, this.modelName).subscribe((res) => {
        if (res) {
          this.project.testData = res.testData;
          console.log(res.message);
        }
        else {
          console.log('ERROR: please try again!');
        }
      })
    }
  }
}
