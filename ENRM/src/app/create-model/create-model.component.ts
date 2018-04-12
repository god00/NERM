import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { FileUploadService } from '../services/fileupload.service';
import NERMModel from '../models/nerm.model';
import { FileUploader } from 'ng2-file-upload';
import { appConfig } from '../app.config';

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
  model: NERMModel;

  corpus = [{ title: 'corpus1', id: 'corpus1', text: "testttttttttttt1" }, { title: 'corpus2', id: 'corpus2', text: "testt2222222222" }];
  dicts = [{ title: 'dict1' }, { title: 'dict2' }]

  selectedDict;
  showText = {};
  // formData: FormData = new FormData();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService,
    private modalService: NgbModal
  ) {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.model = JSON.parse(localStorage.getItem('currentModel'));
  }

  ngOnInit() {

    // if(!this.model){
    //   this.router.navigate(['']);
    // }

    // this.formData.append("email", this.user['email'])

  }

  showCorpus(id: string) {
    let show = this.corpus.filter(c => { return c.id == id })
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

}


