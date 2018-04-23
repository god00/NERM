import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from "@angular/router";
import { MatCheckboxModule, MatTableModule } from '@angular/material';
import { AppComponent } from './app.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FileUploadModule } from 'ng2-file-upload';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';

import { LoginPageComponent } from './login-page/login-page.component';
import { HomeComponent } from './home/home.component';
import { CreateModelComponent } from './create-model/create-model.component';

import { DatabaseService } from './services/database.service';
import { AuthenticationService } from './services/authentication.service';

import { AuthGuard } from './guard/auth.guard';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: ':name', component: CreateModelComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomeComponent,
    CreateModelComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      // set defaults for ngcircle-progress here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    }),
    HttpClientModule,
    FormsModule,
    FileUploadModule,
    AngularMultiSelectModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatTableModule
  ],
  providers: [
    DatabaseService,
    AuthenticationService,
    AuthGuard,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateModelComponent
  ]
})
export class AppModule { }
