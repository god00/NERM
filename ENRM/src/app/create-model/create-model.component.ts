import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';

import NERMModel from '../models/nerm.model';
import { DatabaseService } from '../services/database.service';

import { appConfig } from '../app.config';
import { Subscriber } from 'rxjs';

const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})
export class CreateModelComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  user: Object;
  private sub: any;
  modelForm: FormGroup
  model: NERMModel;
  email: FormControl;
  date: FormControl;
  modelName: FormControl;
  corpus: FormControl;
  dictionary: FormControl;

  getModelSubscribe: any;

  selectedDict;
  showText = {};
  // formData: FormData = new FormData();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public databaseService: DatabaseService
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.model.modelName = JSON.parse(localStorage.getItem('currentModel')) || '';
  }

  ngOnInit() {
    this.createFormControl();
    this.createForm();
    this.getModel();
  }

  createFormControl() {
    this.email = new FormControl(this.model.email);
    this.date = new FormControl('');
    this.modelName = new FormControl(this.model.modelName);
    this.corpus = new FormControl([]);
    this.dictionary = new FormControl([]);
  }

  createForm() {
    this.modelForm = new FormGroup({
      email: this.email,
      date: this.date,
      modelName: this.modelName,
      corpus: this.corpus,
      dictionary: this.dictionary,
    });
  }

  getModel() {
    this.getModelSubscribe = this.databaseService.getModel(this.user['email'], <string>this.model.modelName).subscribe((data) => {
      if (data) {
        this.model = data;
        console.log(data)
      }
      else {
        this.router.navigate(['']);
      }
    })
  }

  showCorpus(id: string) {
    let show = this.corpus.value.filter(c => { return c.id == id })
    this.showText = show[0];
  }

  uploadModal(content, mode) {
    this.uploader = new FileUploader({ url: nermUrl });
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('modelName', this.model.modelName);
      form.append('mode', mode);
      return { fileItem, form }
    };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log("uploaded:", item, status);
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

  public onMouseDown(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'] = !event.target['selected'];
    if (event.target['selected']) {
      this.modelForm.controls.dictionary.value.items.push(item.id);
    } else {
      let index: number = -1;
      index = this.modelForm.controls.dictionary.value.items.indexOf(item.id);
      if (index > -1) {
        this.modelForm.controls.dictionary.value.items.splice(index);
      }
    }
  }

}


