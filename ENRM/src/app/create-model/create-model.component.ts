import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

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
  model: NERMModel = new NERMModel();
  hasError: boolean = false;

  //Multiselect Dropdown Parameters
  dropdownList = [];
  selectedItems: FormControl;
  dropdownSettings = {};

  getModelSubscribe: any;
  selectedSubscribe: any;
  updateModelSubscribe: any;

  showText = {};

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public databaseService: DatabaseService,
    public authenicationService: AuthenticationService,
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.model.modelName = this.router.url.slice(1, this.router.url.length);
    this.model.email = this.user['email']
  }

  ngOnInit() {
    this.getModel();
    this.createSelectedForm();
    console.log(this.selectedItems)
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Dictionary",
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      enableSearchFilter: true,
    };
    this.selectedSubscribe = this.selectedItems.valueChanges.subscribe((selected) => {
      if (this.updateModelSubscribe)
        this.updateModelSubscribe.unsubscribe();
      this.model.selectedDict = this.selectedItems.value;
      this.updateModelSubscribe = this.databaseService.updateNERM(this.model).subscribe((res) => {
        if (res) {
          console.log(res.message)
          console.log(res.data.selectedDict)
        }
      });
    });
  }

  createSelectedForm() {
    this.selectedItems = new FormControl([]);
  }

  getModel() {
    return new Promise((resolve, reject) => {
      this.getModelSubscribe = this.databaseService.getModel(this.user['email'], <string>this.model.modelName).subscribe((data) => {
        if (data) {
          this.model._id = data._id;
          this.model.modelName = data['ModelName'];
          this.model.corpus = data.corpus;
          this.model.date = data.date;
          this.model.dictionary = data.dictionary;
          let selectedTmp = data.selectedDict.map((dict, index) => {
            dict['id'] = index;
            dict['itemName'] = dict['fileName'];
            return dict;
          });
          this.selectedItems.patchValue(selectedTmp);
          this.dropdownList = data.dictionary.map((dict, index) => {
            dict['id'] = index;
            dict['itemName'] = dict['fileName'];
            return dict;
          });
        }
        else {
          console.log('No model')
          this.router.navigate(['']);
        }
        resolve();
      })
    })

  }

  showCorpus(index: number) {
    this.showText = this.model.corpus[index];
  }

  uploadModal(content, mode) {
    let count = 0;
    this.uploader = new FileUploader({ url: nermUrl });
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('modelName', this.model.modelName);
      form.append('mode', mode);
      return { fileItem, form }
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      count = 0;
      this.hasError = item.isError;
      if (this.getModelSubscribe)
        this.getModelSubscribe.unsubscribe();
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
    this.modalService.open(content, { centered: true, size: 'lg' }).result.then((result) => {
      // reset uploader
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      // reset uploader
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
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

  logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}


