import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from './home/home.component';
import { CreateModelComponent } from './create-model/create-model.component';

import { DatabaseService } from './services/database.service';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginPageComponent },
  { path: 'home', component: HomeComponent},
  { path: 'create', component: CreateModelComponent}
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
    RouterModule.forRoot(routes , {useHash:true}),
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    }),
    HttpClientModule
  ],
  providers: [
    DatabaseService
  ],
  bootstrap: [
    AppComponent,
    LoginPageComponent
  ]
})
export class AppModule { }
