import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { collectExternalReferences } from '@angular/compiler/src/output/output_ast';
import { Response } from '@angular/http';

import { debounceTime } from 'rxjs/operator/debounceTime';
import { Subject } from 'rxjs';

import { DatabaseService } from '../services/database.service';
import { AuthenticationService } from '../services/authentication.service';

import NERM from '../models/nermUser.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  user: Object;
  loginForm: FormGroup;
  registerForm: FormGroup;
  lEmail: FormControl;
  lPassword: FormControl;
  rEmail: FormControl;
  rPassword: FormControl;
  rConfirmPassword: FormControl;
  NERMsList: NERM[];

  //Subscription parameter
  getNERM: any;
  loginNERM: any;
  createNERM: any;

  //Alert parameter
  private _success = new Subject<string>();
  alertMessage: string;
  successLogin: boolean = false;


  constructor(
    private router: Router,
    public databaseService: DatabaseService,
    public authenicationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.user) {
      this.router.navigate(['']);
    }

    this.createFormControls();
    this.createForm();

    this._success.subscribe((message) => {
      this.alertMessage = message;
    });
    debounceTime.call(this._success, 3000).subscribe(() => {
      this.alertMessage = null;
    });
  }

  createFormControls() {
    this.lEmail = new FormControl('', [
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*.*")
    ]);
    this.lPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]);
    this.rEmail = new FormControl('', [
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*.*")
    ]);
    this.rPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]);
    this.rConfirmPassword = new FormControl(undefined, [
      Validators.required,
      Validators.minLength(8)
    ]);
  }

  createForm() {
    this.loginForm = new FormGroup({
      email: this.lEmail,
      password: this.lPassword
    });
    this.registerForm = new FormGroup({
      email: this.rEmail,
      password: this.rPassword,
      confirmPassword: this.rConfirmPassword
    });
  }

  onLogin() {
    let loginCheckbox = <HTMLInputElement>document.getElementById("logincheckbox");

    if (this.loginForm.valid) {
      let user = new NERM()
      user.email = this.lEmail.value;
      user.password = this.lPassword.value;

      this.loginNERM = this.authenicationService.loginNERM(user, loginCheckbox.checked)
        .subscribe(res => {
          if (res && res.message === 'Succesfully Login') {
            this.successLogin = true;
            this._success.next(`${new Date()} - Succesfully Login.`);
            setTimeout(() => {
              this.router.navigate(['']);
            }, 3000)
          }
          else {
            this._success.next(` - ${res.message}.`);
          }

          this.loginNERM.unsubscribe();
        }, err => {
          this._success.next(` - Failed to connect database.`);
        }
        )
    }
    else {
      this._success.next(` - Please check Email & Password.`);
    }

  }

  onRegister() {

    if (this.registerForm.valid && this.rConfirmPassword.value === this.rPassword.value) {
      let newUser = new NERM()
      newUser.email = this.rEmail.value;
      newUser.password = this.rPassword.value;
      this.createNERM = this.databaseService.createUser(newUser).subscribe(res => {
        if (res.data) {
          this._success.next(` - ${res.message}.`);
          this.setValue().then(() => {
            this.onLogin();
          })
          this.createNERM.unsubscribe();
        }
        else if (res) {
          this._success.next(` - ${res.message}.`);
          this.createNERM.unsubscribe();
        }
        else {
          this._success.next(` - Unknown error.`);
          this.createNERM.unsubscribe();
        }
      })
    }
    else {
      console.log('Please Check password & confirmpassword')
    }
  }

  setValue() {
    return new Promise((resolve, reject) => {
      this.loginForm.setValue({
        email: this.rEmail.value,
        password: this.rPassword.value
      });
      resolve();
    })
  }

}


