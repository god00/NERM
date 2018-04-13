import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  model: NERMModel = new NERMModel();
  hasError: boolean = false;

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
    this.model.modelName = JSON.parse(localStorage.getItem('currentModel')).modelName;
  }

  ngOnInit() {
    this.getModel();
  }


  getModel() {
    this.getModelSubscribe = this.databaseService.getModel(this.user['email'], <string>this.model.modelName).subscribe((data) => {
      console.log(data)
      if (data) {
        console.log(data)
        this.model._id = data._id;
        this.model.corpus = data.corpus;
        this.model.date = data.date;
        this.model.dictionary = data.dictionary;
      }
      else {
        console.log('no data')
        // this.router.navigate(['']);
      }
    })
  }

  showCorpus(id: string) {
    let show = this.model.corpus.filter(c => { return c['id'] == id })
    console.log(show)
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
      // console.log("uploaded:", item, status);
      this.hasError = item.isError;
      if (this.getModelSubscribe)
        this.getModelSubscribe.unsubscribe();
      this.getModel();
    };
    this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
      // console.log("fail:", item, status);
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

}


