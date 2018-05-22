import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AppComponent } from '../app.component'

import { debounceTime } from 'rxjs/operator/debounceTime';
import { Subject } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';
import NERM from '../models/nermUser.model';
import NERMModel from '../models/nerm.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  updateNERM: any;
  newProjectName: string = '';
  duplicateProjectName: boolean = false;
  nameExcluse: string;
  user: Object;
  projectsByUser: NERMModel[] = [];


  getProjectSubscribe: any;

  //Modal parameter
  modal;
  closeResult: string;
  clickCreate: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authenicationService: AuthenticationService,
    public databaseService: DatabaseService,
    private modalService: NgbModal,
    private appComponent: AppComponent
  ) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.getProjectSubscribe = this.databaseService.getProjects(this.user['email']).subscribe((data) => {
      if (data) {
        this.projectsByUser = data;
      }
    })
  }

  createProject() {
    this.clickCreate = !this.clickCreate;
    let nerm = new NERMModel();

    nerm.email = this.user['email'];
    nerm.projectName = this.newProjectName;

    if (/^[^/]*$/.test(this.newProjectName)) {
      this.updateNERM = this.databaseService.createProject(nerm).subscribe(res => {
        if (res.duplicate) {
          this.duplicateProjectName = true;
        }
        else {
          this.duplicateProjectName = false;
          this.modal.close();
          this.router.navigate([`${this.newProjectName}/create/model`]);
          this.appComponent.updateNavBar();
          this.updateNERM.unsubscribe();
        }
        this.clickCreate = !this.clickCreate;
      });
    }
    else {
      this.nameExcluse = this.newProjectName.toString();
      this.clickCreate = !this.clickCreate;
    }
  }

  openModal(content) {
    this.modal = this.modalService.open(content, { centered: true });
  }

  logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}