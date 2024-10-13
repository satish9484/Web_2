import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private user: UserService, private router: Router) { }

  ngOnInit(): void {
    // set admin data
  }

  redirectToLoginScreen() {
    this.router.navigate(['auth/login'])
  }

}
