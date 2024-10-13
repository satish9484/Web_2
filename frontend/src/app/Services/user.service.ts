import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, retry, throwError } from 'rxjs';
import { User } from '../Models/user';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseAuthUrl = 'http://localhost:80/';
  httpOptions: any = {
    headers: new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    }),
  };
  httpregOptions: any = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  isLogged = new BehaviorSubject<boolean>(this.isLoggedIn());
  isAdmin = new BehaviorSubject<boolean>(this.isAdminRole());
  isUser = new BehaviorSubject<boolean>(this.isUserRole());
  UserName = new BehaviorSubject<string | null>(
    localStorage.getItem('userName')
  );
  role = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  result: any;
  valid: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  getAllUsers() {
    return this.http.get<User[]>(`${this.baseAuthUrl}/users/all`);
  }

  register(user: { email: string; password: string; full_name: string }) {
    return this.http
      .post(this.baseAuthUrl + 'auth/register', user)
      .pipe(retry(1), catchError(this.handleError));
  }

  doLogin(user: { email: string; password: string }) {
    return this.http.post(this.baseAuthUrl + 'auth/login', user);
  }

  validateToken() {
    let header = new HttpHeaders();
    header.set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.baseAuthUrl}/authenticate`, header);
  }

  // getUser(email: string = "") {
  //   let donorsData = JSON.parse(localStorage.getItem("donorsList") || "[]");
  //   let currentUserEmail = email;
  //   if (email === "") {
  //     currentUserEmail = localStorage.getItem('email') || "";
  //   }
  //   if (donorsData === null || !donorsData.length || currentUserEmail === null || currentUserEmail === '') {
  //     return []
  //   } else {
  //     return donorsData.filter((item: DonorInfo) => item.email == currentUserEmail)
  //   }
  // }

  getAllDonors() {
    let donorsData = JSON.parse(localStorage.getItem('donorsList') || '[]');
    if (donorsData === null || !donorsData.length) {
      return [];
    } else {
      return donorsData;
    }
  }

  changeUserPassword(user: User) {
    return this.http
      .put<User>(`${this.baseAuthUrl}/users/`, user, httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }

  //for login user
  loginUser(token: string, email: string, password: string, role: string) {
    this.isLogged.next(true);
    this.UserName.next(email);
    this.isAdmin.next(role === 'admin');
    this.isUser.next(role === 'user');
    this.role.next(role);
    localStorage.setItem('isLogged', '1');
    localStorage.setItem('token', token);
    localStorage.setItem('userName', email);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    return true;
  }

  isLoggedIn() {
    let token = localStorage.getItem('token');
    if (token == undefined || token == null || token == '') {
      this.valid = false;
    } else {
      let decodedToken = this.parseJwtToken(token);
      let currentDate = new Date();
      let expiryDate = new Date(decodedToken.exp * 1000);
      if (currentDate < expiryDate) {
        this.valid = true;
      } else {
        this.valid = false;
        this.router.navigate(['token-expired']);
      }
    }
    return this.valid;
  }

  isAdminRole() {
    let role = localStorage.getItem('role');
    if (role === 'admin') return true;
    return false;
  }

  isUserRole() {
    let role = localStorage.getItem('role');
    if (role === 'user') return true;
    return false;
  }

  logout() {
    this.isLogged.next(false);
    this.isAdmin.next(false);
    this.isUser.next(false);
    this.role.next(null);
    localStorage.setItem('isLogged', '0');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
    localStorage.removeItem('password');
    localStorage.removeItem('role');
    return true;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  get loggedInStatus() {
    return this.isLogged.asObservable();
  }

  get loggedInAdmin() {
    return this.isAdmin.asObservable();
  }

  get loggedInUser() {
    return this.isUser.asObservable();
  }

  get currentUserName() {
    return this.UserName.asObservable();
  }
  get Role() {
    return this.role.asObservable();
  }

  parseJwtToken(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    if (error.status === 409) {
      return throwError(
        () => new Error('This email is already registered, Try signing in')
      );
    } else {
      return throwError(
        () => new Error('Something went bad ! Please try again after sometime')
      );
    }
  }

  validateAdmin(email: string, password: string) {
    let adminData = JSON.parse(localStorage.getItem('adminList') || '[]');

    if (adminData === null || !adminData.length) {
      return {
        success: false,
        message: 'Admin not found',
      };
    } else {
      if (adminData[0].email === email && adminData[0].password === password) {
        return {
          success: true,
          message: 'Logged In',
          auth_token:
            'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJleHBpcmVkIjoiMjAyNi0wOC0xNFQxMDozMTozNi43MjBaIiwidXBkYXRlZF9hdCI6IjIwMjQtMDgtMTZUMDM6NDQ6MzcuMTU4WiIsIm5hbWUiOiJBZG1pbiIsImNyZWF0ZWRfYXQiOiIyMDI0LTA4LTE2VDAzOjQ0OjM3LjE1OFoiLCJpc3N1ZXIiOiJSaXRpY2siLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSJ9.EhcxHSSGjBk9BcxWcQMCTCttg7ajkTK4EmZP0X08UL4',
          user_details: adminData[0],
        };
      } else {
        return {
          success: false,
          message: 'Password not matched',
        };
      }
    }
  }
}
