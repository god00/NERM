import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CreateModelComponent } from '../create-model/create-model.component';

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
  newModelName: string = '';
  duplicateModelName: boolean = false;
  nameExcluse: string;
  user: Object;
  modelsByUser: NERMModel[];


  getModelSubscribe: any;

  //Modal parameter
  modal;
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
    this.getModelSubscribe = this.databaseService.getModels(this.user['email']).subscribe((data) => {
      if (data) {
        this.modelsByUser = data;
      }
      else {

      }
    })
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
    nerm.modelName = this.newModelName;

    if (/^[^/]*$/.test(this.newModelName)) {
      this.updateNERM = this.databaseService.createModel(nerm).subscribe(res => {
        if (res.duplicate) {
          this.duplicateModelName = true;
        }
        else {
          this.duplicateModelName = false;
          this.modal.close();
          this.router.navigate([this.newModelName]);
          this.updateNERM.unsubscribe();
        }
      });
    }
    else {
      this.nameExcluse = this.newModelName.toString();
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