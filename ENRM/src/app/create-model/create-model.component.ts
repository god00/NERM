import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { FileUploadService } from '../services/fileupload.service';

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})
export class CreateModelComponent implements OnInit {
  user: Object;
  private sub: any;
  corpus = [{ title: 'corpus1', id: 'corpus1', text: "testttttttttttt1" }, { title: 'corpus2', id: 'corpus2', text: "testt2222222222" }];
  dicts = [{ title: 'dict1' }, { title: 'dict2' }]
  selectedDict;
  showText = {};
  uploadDict;
  uploader;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService: FileUploadService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.uploader = this.fileUploadService.uploader;
    this.uploader.options.header = []
    this.uploader.options.header.push({ email: this.user['email'] })

  }

  showCorpus(id: string) {
    let show = this.corpus.filter(c => { return c.id == id })
    this.showText = show[0];
  }

  uploadModal(content, mode) {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

}
