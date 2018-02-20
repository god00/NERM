import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { collectExternalReferences } from '@angular/compiler/src/output/output_ast';
import { DatabaseService } from '../database.service';

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

  constructor(
    private router: Router,
    public databaseService: DatabaseService
  ) {
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();
    this.databaseService.dbConnection().then(()=>{
      console.log('Connection established');
      this.databaseService.readDBFromTable('user');
    }).catch((err)=>{
      console.log('Error connecting to Db');
    })

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
      password: this.password,
      confirmPassword: this.confirmPassword
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      //Check Email in database
      let email = this.loginForm.controls.email.value
      this.router.navigate(['home', { clearHistory: true, email }])
    }
    else {
      console.log("try again")
      console.log(this.loginForm.controls.email.value)
      console.log(this.loginForm.controls.password.value)
    }
  }

  onRegister() {
    if(this.confirmPassword.value === this.password.value){
      //Create Emain in database
      this.onLogin()
    }
    else{
      console.log('error')
    }
  }
}


