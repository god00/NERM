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
            console.log('login success')
            this.loginNERM.unsubscribe();
          }
          else {
            console.log("try again");
            this.loginNERM.unsubscribe();
          }
        })
    }
    else {
      console.log('login error')
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
          this.loginNERM.unsubscribe();
        }
        else if (res) {
          console.log(res.message);
          this.loginNERM.unsubscribe();
        }
        else{
          console.log('error')
        }
      })
      // this.getDB()
      //   .then(() => {

      //     // Create Email in database
      //     this.checkDB(this.rEmail, this.rPassword)
      //       .then((user: any) => {
      //         if (user.length === 0) {
      //           this.createDB(this.rEmail, this.rPassword)
      //             .then(() => {
      //               this.onLogin();
      //               console.log('regis success')
      //             })
      //             .catch((err) => {
      //               console.log(err);
      //             })
      //         }
      //         else {
      //           console.log("try again")
      //         }
      //       })
      //   })
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
            email: this.rEmail.value,
            password: this.rPassword.value
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


