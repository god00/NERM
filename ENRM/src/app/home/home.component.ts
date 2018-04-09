import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { debounceTime } from 'rxjs/operator/debounceTime';
import { Subject } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AuthenticationService } from '../services/authentication.service';
import { DatabaseService } from '../services/database.service';
import NERM from '../models/nerm.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  updateNERM: any;
  modelName: string;
  duplicateModelName: boolean = false;
  user: Object;

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

  createModal(name: string) {
    let user = new NERM();
    let model = {
      name: this.modelName,
      //parameter and more...
    }
    user.email = this.user['email'];
    user.models.push(model);
    this.updateNERM = this.databaseService.updateNERM(user).subscribe(res => {
      if (res.duplicate) {
        this.duplicateModelName = true;
      }
      else {
        this.duplicateModelName = false;
        this.router.navigate(['create']);
      }
    });

  }

  openModal(content) {
    this.modalService.open(content, <object>{ centered: true });
  }

  logout() {
    this.authenicationService.logout();
    this.router.navigate(['login']);
  }

}
