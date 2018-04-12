import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { FileUploadService } from '../services/fileupload.service';
import NERMModel from '../models/nerm.model';

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})
export class CreateModelComponent implements OnInit {
  user: Object;
  private sub: any;
  model: NERMModel;

  corpus = [{ title: 'corpus1', id: 'corpus1', text: "testttttttttttt1" }, { title: 'corpus2', id: 'corpus2', text: "testt2222222222" }];
  dicts = [{ title: 'dict1' }, { title: 'dict2' }]

  selectedDict;
  showText = {};
  // formData: FormData = new FormData();
  uploader;

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
    this.uploader = this.fileUploadService.uploader;
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('modelName', this.model.modelName);
      form.append('mode', mode);
      return { fileItem, form }
    };
    this.modalService.open(content, { centered: true, size: 'lg' });
  }



  // fileChange(event) {
  //   let fileList: FileList = event.target.files;
  //   for (let i = 0; i < fileList.length; i++) {
  //     this.formData.append("uploads", fileList[i], fileList[i].name);
  //   }

  //   this.fileUploadService.uploadNERM(this.formData)
  //     .map(res => res.json())
  //     .subscribe(data => {
  //       // SHOW A MESSAGE RECEIVED FROM THE WEB API.
  //       console.log(data as string);
  //       this.formData = new FormData();

  //     },
  //       (err) => {
  //         console.log(err.message);    // SHOW ERRORS IF ANY.
  //       }
  //     )

  // }
}


