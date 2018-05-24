import { Component, OnInit } from '@angular/core';

import { AppComponent } from '../app.component';

import NERMModel from '../models/nerm.model';

@Component({
  selector: 'app-predict-page',
  templateUrl: './predict-page.component.html',
  styleUrls: ['./predict-page.component.css']
})
export class PredictPageComponent implements OnInit {
  projectsByUser: NERMModel[] = [];

  constructor(private appComponent: AppComponent) { }

  ngOnInit() {
    this.projectsByUser = this.appComponent.projectsByUser;
  }

  onSelect(ev) {
    console.log(ev.target)
    let projectName = ev.target.selectedOption[0].parentNode.label;
    let modelName = ev.target.selectedOption[0].value;
    console.log(projectName,"  :  ",modelName)
  }

}
