import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Blog {
  url: string;
  previewImage: string;
  title: string;
  key: number;
  description: string;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  loader: boolean;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.loader = true;
  }

  ngOnInit(): void {
    this.getBlogData();
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  getBlogData() {
    this.http.get('http://localhost:80/user/get-all-blogs').subscribe({
      next: (response: any) => {
        if (response.success) {
          let temp: Blog[] = [];
          response.blogs.map((item: any) => {
            temp.push({
              url: item.url,
              previewImage: item.image_url,
              title: item.title,
              description: item.description,
              key: item._id,
            });
          });
          this.blogs = temp;
        } else {
          this.openSnackBar(response.message, 'Ok');
        }
      },
      error: () => {
        this.openSnackBar('Failed to load data', 'Ok');
      },
      complete: () => {
        this.loader = false;
      },
    });
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    });
  }
}
