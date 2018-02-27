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
  getNERM: any;
  NERMsList: NERM[];

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
      this.getDB().then(() => {
        console.log(this.NERMsList)
        //Check Email in database
        this.checkDB(this.lEmail, this.lPassword).then((user: any) => {
          if (user.length !== 0) {
            let email = this.loginForm.controls.email.value;
            this.router.navigate(['home', { clearHistory: true, email }]);
            this.getNERM.unsubscribe();
          }
          else {
            console.log("try again");
          }
        })
      })
    }
    else{
      console.log('login error')
    }

  }

  onRegister() {

    if (this.registerForm.valid && this.rConfirmPassword.value === this.rPassword.value) {

      this.getDB().then(() => {

        // Create Email in database
        this.checkDB(this.rEmail, this.rPassword).then((user: any) => {
          if (user.length === 0) {
            this.createDB(this.rEmail, this.rPassword).then(() => {
              console.log(this.loginForm)
              this.onLogin();
              this.getNERM.unsubscribe();
              console.log('regis success')
            })
              .catch((err) => {
                console.log(err);
              })
          }
          else {
            console.log("try again")
          }
        })
      })
    }
    else {
      console.log('error')
    }
  }

  checkDB(email, password) {
    return new Promise((resolve, reject) => {
      let user = this.NERMsList.filter((nerms) =>
        nerms.email === email.value && nerms.password === password.value
      )
      resolve(user);
    })
  }

  createDB(email, password) {
    let newNERM = new NERM()
    newNERM.email = email.value;
    newNERM.password = password.value;
    return new Promise((resolve, reject) => {
      let databaseSub = this.databaseService.createNERM(newNERM)
        .subscribe((res) => {
          this.NERMsList.push(res.data)
          databaseSub.unsubscribe();
          this.loginForm.setValue({
            email: this.rEmail, password: this.rPassword
          });
          resolve();
        }
          , (err) => {
            reject(err)
          })
    })
  }

  getDB() {
    return new Promise((resolve, reject) => {
      this.getNERM = this.databaseService.getNERMs()
        .subscribe(nerms => {
          this.NERMsList = nerms;
          resolve();
        })
    })

  }

}


