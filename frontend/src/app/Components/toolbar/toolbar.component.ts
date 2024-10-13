import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { UserService } from 'src/app/Services/user.service'

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent {
  titleFlag = true
  isLoggedIn$: any
  UserName$: any
  role$: any
  isAdmin$: any
  isUser$: any
  name: string = ""
  constructor(private user: UserService, private router: Router) { }


  ngOnInit(): void {
    this.isLoggedIn$ = this.user.loggedInStatus
    this.UserName$ = this.user.currentUserName
    this.role$ = this.user.Role
    this.isAdmin$ = this.user.loggedInAdmin;
    this.isUser$ = this.user.loggedInUser
  }

  ngOnChanges(): void {
  }



  logout() {
    this.user.logout()
    this.ngOnInit()
    this.router.navigate(['auth/login'])
  }
}
