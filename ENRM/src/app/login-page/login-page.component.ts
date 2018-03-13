import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { collectExternalReferences } from '@angular/compiler/src/output/output_ast';
import { Response } from '@angular/http';

import { DatabaseService } from '../services/database.service';

import NERM from '../models/nerm.model';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

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


  constructor(
    private router: Router,
    public databaseService: DatabaseService,
  ) {
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();
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
    if (this.loginForm.valid) {
      let user = new NERM()
      user.email = this.lEmail.value;
      user.password = this.lPassword.value;

      this.loginNERM = this.databaseService.loginNERM(user)
        .subscribe(res => {
          if (res.data) {
            let email = this.loginForm.controls.email.value;
            this.router.navigate(['home', { clearHistory: true, email }]);
            console.log(res.message)
            this.loginNERM.unsubscribe();
          }
          else {
            console.log(res.message);
            this.loginNERM.unsubscribe();
          }
        })
    }
    else {
      console.log('Please Input Email & Password')
    }

  }

  onRegister() {

    if (this.registerForm.valid && this.rConfirmPassword.value === this.rPassword.value) {
      let newUser = new NERM()
      newUser.email = this.rEmail.value;
      newUser.password = this.rPassword.value;
      this.createNERM = this.databaseService.createNERM(newUser).subscribe(res => {
        if (res.data) {
          console.log(res.message)
          this.setValue().then(() => {
            this.onLogin();
          })
          this.createNERM.unsubscribe();
        }
        else if (res) {
          console.log(res.message);
          this.createNERM.unsubscribe();
        }
        else {
          console.log('error')
        }
      })
    }
    else {
      console.log('Please Insert Form')
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


