import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  dicts = [{title:'dict1'} , {title:'dict2'}]
  selectedDict ;
  showText = {};
  uploadDict ; 
  uploader;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fileUploadService:FileUploadService
  ) { 
    this.uploader = fileUploadService.getUploader();
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
  }

  showCorpus(id: string) {
    let show = this.corpus.filter(c => { return c.id == id })
    this.showText = show[0];
  }

  upload(){
    var selectedFile = <HTMLInputElement>document.getElementById('files');
    console.log(selectedFile.files)
  }
}
