import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { Buffer } from 'buffer';

import { FileUploader, FileItem } from 'ng2-file-upload';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';

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
  isLastModel: boolean;
  index: number;
  testDataId: any;
  projectTmp: any;
  testing: boolean;
  output: any = [];
  isFillItem: boolean = false;

  // upload parameter
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  hasError: boolean = false;
  deleteTestDataName: string = '';

  //Output table
  displayedColumnsOutput: any;
  outputTable: any = [];
  dataSourceOutput: any;

  getProjectSubscribe: any;
  getTestDataSubscribe: any;
  updateProjectSubscribe: any;
  testModelSubscribe: any;
  downloadModelSubscribe: any;

  intervalId: any;
  testIntervalId: any;

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
      if (!this.project.model.includes(this.modelName)) {
        this.router.navigate([`${this.project.projectName}`])
      }
      if (this.project.isTraining && this.isLastModel) {
        this.setIntervalProject();
      }
      this.getTestData().then(() => {
        this.isFillItem = true;
        this.setIntervalTestData();
      });

    });
  }

  ngOnDestroy() {
    if (this.getProjectSubscribe) {
      this.getProjectSubscribe.unsubscribe();
    }
    if (this.updateProjectSubscribe) {
      this.updateProjectSubscribe.unsubscribe();
    }
    if (this.getTestDataSubscribe) {
      this.getTestDataSubscribe.unsubscribe();
    }
    if (this.testModelSubscribe) {
      this.testModelSubscribe.unsubscribe();
    }
    if (this.downloadModelSubscribe) {
      this.downloadModelSubscribe.unsubscribe();
    }
    if (this.intervalId)
      clearInterval(this.intervalId);
    if (this.testIntervalId)
      clearInterval(this.testIntervalId);
  }

  getProject() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProject(this.user['email'], encodeURI(<string>this.project.projectName)).subscribe(async (data) => {
        if (data) {
          this.projectTmp = data['project'];
          this.index = data['project'].model.indexOf(this.modelName);
          this.project.model = data['project'].model;
          this.project.isTraining = data['project'].isTraining;
          if (this.index != -1) {
            this.project.corpusInfo = data['project'].corpusInfo[this.index];
          }
          this.isLastModel = (this.index == data['project'].model.length - 1);
        }
        else {
          console.log('No model');
          this.router.navigate(['']);
        }
        resolve();
      })
    })
  }

  getTestData() {
    return new Promise((resolve, reject) => {
      if (this.getTestDataSubscribe)
        this.getTestDataSubscribe.unsubscribe();

      this.getTestDataSubscribe = this.databaseService.getTestData(this.user['email'], encodeURI(<string>this.project.projectName), this.modelName , 'test').subscribe(async (data) => {
        if (data) {
          this.project.testData = data['testData'];
          this.testDataId = data['id'];
          this.testing = data['testing'];
          if (data['output']) {
            this.output = data['output'].data.split('\n');
            this.output.splice(-1, 1)
            this.insertDataTable();
          }
        }
        else {
          console.log('No Test Data');
        }
        resolve();
      })
    })
  }


  goToCreateModel() {
    this.projectTmp.summitPreProcessing = false;
    if (this.updateProjectSubscribe) {
      this.updateProjectSubscribe.unsubscribe();
    }
    this.updateProjectSubscribe = this.databaseService.updateNERM(this.projectTmp).subscribe((res) => {
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
      this.getTestData();
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
    this.deleteTestDataName = this.project.testData[index]['fileName'];
    this.modalService.open(content, { centered: true, size: 'sm' }).result.then((result) => {
      this.deleteTestDataName = '';
    }, (reason) => {
      this.deleteTestDataName = '';
    });
  }

  testModel() {
    this.testing = true;
    this.testModelSubscribe = this.databaseService.testModel(this.user['email'], encodeURI(<string>this.project.projectName), this.modelName).subscribe((res) => {
      if (res) {
        this.setIntervalTestData();
      }
    })
  }

  insertDataTable() {
    if (this.outputTable.length != 0)
      this.outputTable = []
    this.output.forEach((row, index) => {
      if (index == 0) {
        this.displayedColumnsOutput = row.split('\t');
      }
      else {
        let arrColumn = row.split('\t');
        let dataObject = {};
        dataObject['class'] = arrColumn[0];
        dataObject['Recall'] = arrColumn[1];
        dataObject['Precision'] = arrColumn[2];
        dataObject['F1-measure'] = arrColumn[4];
        this.outputTable.push(dataObject);
      }
    });
    this.dataSourceOutput = new MatTableDataSource(this.outputTable);
  }

  deleteTestData() {
    if (this.deleteTestDataName != '') {
      this.databaseService.deleteTestData(this.testDataId, this.deleteTestDataName).subscribe((res) => {
        if (res) {
          this.project.testData = res.testData;
        }
        else {
          console.log('ERROR: please try again!');
        }
      })
    }
  }

  downloadModel() {
    if (this.downloadModelSubscribe) {
      this.downloadModelSubscribe.unsubscribe();
    }
    this.downloadModelSubscribe = this.databaseService.downloadModel(this.user['email'], encodeURI(<string>this.project.projectName), this.modelName).subscribe((res) => {
      let buffer = Buffer.from(res.file.data);
      var file = new File([buffer.toString()], this.modelName, { type: "application/octet-stream;charset=binary" });
      FileSaver.saveAs(file);
    })
  }

  setIntervalProject() {
    if (this.intervalId)
      clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.getProjectSubscribe) {
        this.getProjectSubscribe.unsubscribe();
      }
      this.getProject().then(() => {
        if (!this.project.isTraining) {
          if (this.intervalId)
            clearInterval(this.intervalId);
        }
      });
    }, 3500)
  }

  setIntervalTestData() {
    if (this.testing) {
      if (this.testIntervalId)
        clearInterval(this.testIntervalId);
      this.testIntervalId = setInterval(() => {
        this.getTestData().then(() => {
          if (!this.testing) {
            if (this.testIntervalId)
              clearInterval(this.testIntervalId);
          }
        });
      }, 3500)
    }
  }

}


