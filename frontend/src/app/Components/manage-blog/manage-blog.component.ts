import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-blog',
  templateUrl: './manage-blog.component.html',
  styleUrls: ['./manage-blog.component.css'],
})
export class ManageBlogComponent implements OnInit {
  dataSource: {}[] = [];
  loader: boolean;
  displayedColumns: string[] = [
    // "s_no",
    'url',
    'image_url',
    //  "title", "description",
    'action',
  ];
  url: string;
  image_url: string;
  title: string;
  description: string;
  isModalOpen: string;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.loader = true;
    this.url = '';
    this.image_url = '';
    this.title = '';
    this.isModalOpen = '-1';
    this.description = '';
  }

  ngOnInit(): void {
    this.getBlogData();
  }

  editBlogPost(blog: any) {
    this.isModalOpen = blog.s_no;
    this.url = blog.url;
    this.image_url = blog.image_url;
    this.title = blog.title;
    this.description = blog.description;
  }

  closeModal() {
    this.isModalOpen = '-1';
  }

  getBlogData() {
    this.http.get('http://localhost:80/admin/get-all-blogs').subscribe({
      next: (response: any) => {
        if (response.success) {
          let temp: {}[] = [];
          response.blogs.map((item: any) => {
            temp.push({
              url: item.url,
              image_url: item.image_url,
              title: item.title,
              description: item.description,
              s_no: item._id,
              updated_at: item.updated_at,
            });
          });
          this.dataSource = temp;
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

  deleteBlogData(blog_id: string) {
    this.http
      .delete('http://localhost:80/admin/delete-blog/' + blog_id)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.openSnackBar(response.message, 'Ok', true);
            this.loader = true;
            this.getBlogData();
            this.resetAll();
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

  resetAll() {
    this.url = '';
    this.image_url = '';
    this.title = '';
    this.description = '';
  }

  createPost() {
    this.http
      .post('http://localhost:80/admin/create-blog', {
        url: this.url,
        image_url: this.image_url,
        title: this.title,
        description: this.description,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.openSnackBar(response.message, 'Ok', true);
            this.loader = true;
            this.getBlogData();
            this.resetAll();
            this.closeModal();
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

  updateBlogData() {
    this.http
      .put('http://localhost:80/admin/get-all-blogs', {
        url: this.url,
        image_url: this.image_url,
        title: this.title,
        description: this.description,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.openSnackBar(response.message, 'Ok', true);
            this.loader = true;
            this.getBlogData();
            this.resetAll();
            this.closeModal();
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
