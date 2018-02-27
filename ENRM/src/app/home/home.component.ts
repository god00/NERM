import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  email: string;
  Model: string;
  private sub: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { 
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];
   });
   
   if(!this.email){
    this.router.navigate(['login'])
   }

  }
  
  createModal(){
    let email = this.email
    this.sub.unsubscribe()
    this.router.navigate(['create', { clearHistory: true, email }])
  }

}
