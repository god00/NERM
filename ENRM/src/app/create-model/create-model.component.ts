import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader, FileItem } from 'ng2-file-upload';

import NERMModel from '../models/nerm.model';
import { DatabaseService } from '../services/database.service';

import { appConfig } from '../app.config';
import { AuthenticationService } from '../services/authentication.service';
import { checkAndUpdateTextDynamic } from '@angular/core/src/view/text';

const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})

export class CreateModelComponent implements OnInit, OnDestroy {
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  user: Object;
  project: NERMModel = new NERMModel();
  hasError: boolean = false;
  deleteCorpusName: string = '';
  activeIdString: string;

  //dictfeature table 
  displayedColumnsDict: any = ["dictionary"];
  dictFeature: any;
  dataSourceDict: any;

  //wordfeature table
  displayedColumnsWord: any = ["wordFeature", "0"];
  wordFeature: any;
  dataSourceWord: any;


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
    this.project.email = this.user['email'];
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
  }


  ngOnDestroy() {
    if (this.getProjectSubscribe)
      this.getProjectSubscribe.unsubscribe()
    if (this.selectedSubscribe)
      this.selectedSubscribe.unsubscribe()
    if (this.updateProjectSubscribe)
      this.updateProjectSubscribe.unsubscribe()
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
          this.project.summitPreProcessing = data['project'].summitPreProcessing;
          this.project.featureSelection = data['project'].featureSelection;
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
          if (!this.project.summitPreProcessing) {
            this.updateSelectedDict()
            this.selectedItems.patchValue(selectedTmp);
          }
          this.project.featureSelection['vocabFeature'].forEach(item => {
            if (item.selected) {
              this.displayedColumnsDict.push(`${item.id}`)
              this.displayedColumnsDict.sort((a, b) => { return a - b })
            }
          });
          if (this.project.featureSelection['dictFeature'].length != 0) {
            this.dictFeature = this.project.featureSelection['dictFeature'];
          }
          else {
            this.initDictFeature(data['project'].selectedDict);
          }

          this.dataSourceDict = new MatTableDataSource(this.dictFeature);
          if (this.project.summitPreProcessing) {
            this.activeIdString = "featureSelection"
          }
          else {
            this.activeIdString = "preProcess"
          }
          this.wordFeature = data['project'].featureSelection['wordFeature'];
          this.dataSourceWord = new MatTableDataSource(this.wordFeature);


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
    if (this.showText != this.project.corpus[index])
      this.showText = this.project.corpus[index];
    else
      this.showText = {}
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

  updateSelectedDict() {
    this.selectedSubscribe = this.selectedItems.valueChanges.subscribe((selected) => {
      if (this.updateProjectSubscribe)
        this.updateProjectSubscribe.unsubscribe();
      this.project.selectedDict = this.selectedItems.value;
      this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
        if (res) {
          console.log("updateSelectedDict", res.message)
        }
      });
    });
  }

  updateVocabFeature(id: number, checked: boolean) {
    if (checked) {
      this.displayedColumnsDict.push(`${id}`)
      this.displayedColumnsDict.sort((a, b) => { return a - b })
      this.dictFeature.map(item => {
        item[id] = false;
        return item
      })
    }
    else {
      let index = this.displayedColumnsDict.indexOf(`${id}`)
      if (index != -1)
        this.displayedColumnsDict.splice(index, 1)
      this.dictFeature.map(item => {
        if (item[index])
          delete item[index];
        return item
      })
    }
    if (this.updateProjectSubscribe)
      this.updateProjectSubscribe.unsubscribe();
    this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
      if (res) {
        console.log("updateVocabFeature", res.message)
      }
    });
  }

  updateFeature(id: string, element: any, mode: string) {
    if (mode == 'dict')
      this.project.featureSelection['dictFeature'] = this.dataSourceDict.data;
    else if (mode == 'word')
      this.project.featureSelection['wordFeature'] = this.dataSourceWord.data;
    if (this.updateProjectSubscribe)
      this.updateProjectSubscribe.unsubscribe();
    this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
      if (res) {
        console.log(`update${mode}Feature :`, res.message)
      }
    });
  }

  openSummitProprocessModal(content, f) {
    this.modalService.open(content, { centered: true, size: 'sm' })
  }

  onSummit() {
    let f = document.getElementById('t')
    console.log(f)
    if (this.updateProjectSubscribe)
      this.updateProjectSubscribe.unsubscribe();
    if (this.project.summitPreProcessing == false) {
      this.project.summitPreProcessing = true;
      this.updateProjectSubscribe = this.databaseService.updateNERM(this.project).subscribe((res) => {
        if (res) {
          this.initDictFeature(res.data['project'].selectedDict);
          this.dataSourceDict.data = this.dictFeature;
          f.activeId = "featureSelection";
        }
      });
    }
  }

  initDictFeature(selectedDict) {
    this.dictFeature = selectedDict.map((dict) => {
      return { 'dictionary': dict['fileName'], '0': false, '1': false, '2': false, '3': false, '-1': false, '-2': false, '-3': false }
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


