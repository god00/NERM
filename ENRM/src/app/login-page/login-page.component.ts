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
  email: FormControl;
  password: FormControl;
  confirmPassword: FormControl;
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
    this.email = new FormControl('', [
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*.*")
    ]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]);
    this.confirmPassword = new FormControl(undefined, [
      Validators.minLength(8)
    ]);
  }

  createForm() {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password
    });
    this.registerForm = new FormGroup({
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    });
  }

  onLogin() {
    console.log('login')
    if (this.loginForm.valid) {
      console.log('loginform valid')
      this.getDB().then(() => {
        console.log(this.NERMsList)
        //Check Email in database
        this.checkDB().then((user: any) => {
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

  }

  onRegister() {
    if (this.confirmPassword.value === this.password.value) {

      this.getDB().then(() => {

        // Create Email in database
        this.checkDB().then((user: any) => {
          if (user.length === 0) {
            this.createDB().then(() => {
              this.onLogin();
              this.getNERM.unsubscribe();
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

  checkDB() {
    return new Promise((resolve, reject) => {
      let user = this.NERMsList.filter((nerms) =>
        nerms.email === this.email.value && nerms.password === this.password.value
      )
      resolve(user);
    })
  }

  createDB() {
    let newNERM = new NERM()
    newNERM.email = this.email.value;
    newNERM.password = this.password.value;
    return new Promise((resolve, reject) => {
      let databaseSub = this.databaseService.createNERM(newNERM)
        .subscribe((res) => {
          this.NERMsList.push(res.data)
          databaseSub.unsubscribe();
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


