import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
  modelName: string = '';
  duplicateModelName: boolean = false;
  checkExclues: boolean = false;
  user: Object;
  modal;

  //Modal parameter
  closeResult: string;

  //Alert parameter
  private _success = new Subject<string>();
  alertMessage: string;
  successLogin: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authenicationService: AuthenticationService,
    public databaseService: DatabaseService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));

    this._success.subscribe((message) => {
      this.alertMessage = message;
    });
    debounceTime.call(this._success, 3000).subscribe(() => {
      this.alertMessage = null;
      this.successLogin = null;
    });
    if (this.user) {
      this.successLogin = true;
      this._success.next(`${new Date()} - Succesfully Login.`);
    }
  }

  createModal() {
    let nerm = new NERMModel();

    nerm.email = this.user['email'];
    nerm.modelName = this.modelName;

    this.updateNERM = this.databaseService.createModel(nerm).subscribe(res => {
      if (res.duplicate) {
        this.duplicateModelName = true;
      }
      else if (/^[^/ ]*$/.test(this.modelName)) {
        this.duplicateModelName = false;
        localStorage.setItem('currentModel', JSON.stringify(nerm));
        this.modal.close();
        this.router.navigate(['create']);
        this.updateNERM.unsubscribe();
      }
      else {
        this.checkExclues = true;
      }
    });

  }

  openModal(content) {
    this.modal = this.modalService.open(content, { centered: true });
  }

  logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

  checkInput() {
    if (!(/^[^/ ]*$/.test(this.modelName))) {
      this.checkExclues = false;
    }
  }

}