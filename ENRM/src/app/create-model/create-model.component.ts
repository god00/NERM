import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.css']
})
export class CreateModelComponent implements OnInit {
  user: Object;
  private sub: any;
  corpus = [{ title: 'corpus1', id: 'corpus1',  text: "testttttttttttt1"},{ title: 'corpus2', id: 'corpus2',  text: "testt2222222222"}];
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
  }

}
