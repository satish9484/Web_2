import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core'
import { MatCardModule } from '@angular/material/card'

import {MatChipsModule} from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatMenuModule } from '@angular/material/menu'
import {MatTableModule} from '@angular/material/table';

import {MatSortModule} from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatGridListModule} from '@angular/material/grid-list'
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';

const modules = [
  MatButtonModule,
  MatSortModule,
  MatDialogModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatIconModule,
  MatToolbarModule,
  MatSidenavModule,
  MatNativeDateModule,
  MatCardModule,
  MatRippleModule,
  MatChipsModule,
  MatSnackBarModule,
  MatMenuModule,
  MatTableModule,
  MatGridListModule,
  MatExpansionModule,
  MatDatepickerModule
]

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [modules],
})
export class NgMaterialModule {}
