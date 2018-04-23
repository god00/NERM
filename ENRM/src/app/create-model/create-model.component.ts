import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader, FileItem } from 'ng2-file-upload';

import NERMModel from '../models/nerm.model';
import { DatabaseService } from '../services/database.service';

import { appConfig } from '../app.config';
import { AuthenticationService } from '../services/authentication.service';

const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})

export class CreateModelComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  user: Object;
  project: NERMModel = new NERMModel();
  hasError: boolean = false;
  deleteCorpusName: string = '';
  vocabFeature = [
    { name: 'W10', selected: false, id: -5 },
    { name: 'W9', selected: false, id: -4 },
    { name: 'W8', selected: false, id: -3 },
    { name: 'W7', selected: false, id: -2 },
    { name: 'W6', selected: false, id: -1 },
    { name: 'W0', selected: false, id: 0 },
    { name: 'W1', selected: false, id: 1 },
    { name: 'W2', selected: false, id: 2 },
    { name: 'W3', selected: false, id: 3 },
    { name: 'W4', selected: false, id: 4 },
    { name: 'W5', selected: false, id: 5 },
  ];

  //dictfeature table 
  displayedColumns = ["dictionary"];
  dictFeature: any;
  dataSource: any;

  //Multiselect Dropdown Parameters
  dropdownList = [];
  selectedItems: FormControl;
  dropdownSettings = {};

  getProjectSubscribe: any;
  selectedSubscribe: any;
  updateProjectSubscribe: any;

  showText = {};

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public databaseService: DatabaseService,
    public authenicationService: AuthenticationService,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.project.projectName = decodeURI(this.router.url.slice(1, this.router.url.length));
    this.project.email = this.user['email']
  }

  ngOnInit() {
    this.getModel();
    this.createSelectedForm();
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Dictionary",
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      enableSearchFilter: true,
    };
    this.selectedSubscribe = this.selectedItems.valueChanges.subscribe((selected) => {
      if (this.updateProjectSubscribe)
        this.updateProjectSubscribe.unsubscribe();
      this.project.selectedDict = this.selectedItems.value;
      this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
        if (res) {
          console.log(res.message)
        }
      });
    });
  }

  createSelectedForm() {
    this.selectedItems = new FormControl([]);
  }

  getModel() {
    return new Promise((resolve, reject) => {
      this.getProjectSubscribe = this.databaseService.getProject(this.user['email'], encodeURI(<string>this.project.projectName)).subscribe((data) => {
        if (data) {
          this.project._id = data['project']._id;
          this.project.projectName = data['project']['projectName'];
          this.project.corpus = data['project'].corpus;
          this.project.date = data['project'].date;
          this.project.dictionary = data['dictionary'];
          this.dropdownList = data['dictionary'].map((dict, index) => {
            dict['id'] = index;
            dict['itemName'] = dict['fileName'];
            return dict
          });
          let selectedTmp = data['project'].selectedDict.map((dict) => {
            let selected = this.dropdownList.filter(item => {
              if (item.fileName == dict['fileName'])
                return item
            })
            return selected[0]
          });
          this.selectedItems.patchValue(selectedTmp);
          this.dictFeature = data['project'].selectedDict.map((dict) => {
            return { 'dictionary': dict['fileName'] }
          })
          console.log(this.dictFeature)
          this.dataSource = new MatTableDataSource(this.dictFeature);

        }
        else {
          console.log('No model');
          this.router.navigate(['']);
        }
        resolve();
      })
    })

  }

  showCorpus(index: number) {
    this.showText = this.project.corpus[index];
  }

  uploadModal(content, mode) {
    let count = 0;
    this.uploader = new FileUploader({ url: nermUrl });
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('projectName', this.project.projectName);
      form.append('mode', mode);
      return { fileItem, form }
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      count = 0;
      this.hasError = item.isError;
      if (this.getProjectSubscribe)
        this.getProjectSubscribe.unsubscribe();
      this.getModel().then(() => {
        var dupSelected = this.selectedItems.value.filter(function (el) {
          return el.fileName === item.file.name;
        });
        if (dupSelected.length == 0) {
          let selectedTmp = this.selectedItems.value;
          this.dropdownList.map((dict, index) => {
            if (dict['fileName'] == item.file.name)
              selectedTmp.push(dict)
          })
          this.selectedItems.patchValue(selectedTmp);
        }
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  openConfirmModal(content, index) {
    this.deleteCorpusName = this.project.corpus[index]['fileName'];
    this.modalService.open(content, { centered: true, size: 'sm' }).result.then((result) => {
      this.deleteCorpusName = '';
    }, (reason) => {
      this.deleteCorpusName = '';
    });
  }

  deleteCorpus() {
    if (this.deleteCorpusName != '') {
      this.databaseService.deleteCorpus(this.project._id, this.deleteCorpusName).subscribe((res) => {
        if (res) {
          this.project.corpus = res.corpus;
          this.showText = {};
          console.log(res.message);
        }
        else {
          console.log('ERROR: please try again!');
        }
      })
    }

  }

  updateVocab(id: number) {
    this.displayedColumns.push(`${id}`);
    this.dictFeature.map(item => {
      item[id] = false;
      return item
    })
  }

  // onItemSelect(item: any) {
  //   console.log(this.selectedItems.value);
  // }
  // OnItemDeSelect(item: any) {
  //   console.log(this.selectedItems.value);
  // }
  // onSelectAll(items: any) {
  //   console.log(this.selectedItems.value);
  // }
  // onDeSelectAll(items: any) {
  //   console.log(this.selectedItems.value);
  // }

  public logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}


