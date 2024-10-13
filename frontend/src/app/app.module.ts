import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ToolbarComponent } from './Components/toolbar/toolbar.component'
import { LayoutModule } from '@angular/cdk/layout'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { LoginComponent } from './Components/login/login.component'
import { RegisterComponent } from './Components/register/register.component'
import { NgMaterialModule } from './Modules/ng-material/ng-material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ConfirmPasswordValidatorDirective } from './Directives/confirm-password-validator.directive';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { OldConfirmValidatorDirective } from './Directives/old-confirm-validator.directive';
import { ZoomHoverDirective } from './Directives/zoom-hover.directive'
import { BasicAuthHttpInterceptor } from './Services/basic-auth-http.interceptor';
import { RegisterPageComponent } from './Components/register-page/register-page.component';
import { HomePageComponent } from './Components/home-page/home-page.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { CustomModalComponent } from './Components/custom-modal/custom-modal.component';
import { UrlDetectorComponent } from './Components/url-detector/url-detector.component';
import { BulkUrlDetectorComponent } from './Components/bulk-url-detector/bulk-url-detector.component';
import { TokenExpiredComponent } from './Components/token-expired/token-expired.component';
import { ForgotPasswordComponent } from './Components/forgot-password/forgot-password.component'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FaqComponent } from './Components/faq/faq.component';
import { UrlFeedbackComponent } from './Components/url-feedback/url-feedback.component';
import { UserFeedbackComponent } from './Components/user-feedback/user-feedback.component';
import { CustomGraphComponent } from './Components/custom-graph/custom-graph.component';
import { ManagerUserComponent } from './Components/manager-user/manager-user.component';
import { BlogComponent } from './Components/blog/blog.component';
import { ManageBlogComponent } from './Components/manage-blog/manage-blog.component'

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    LoginComponent,
    RegisterComponent,
    ConfirmPasswordValidatorDirective,
    PageNotFoundComponent,
    OldConfirmValidatorDirective,
    ZoomHoverDirective,
    RegisterPageComponent,
    HomePageComponent,
    DashboardComponent,
    CustomModalComponent,
    UrlDetectorComponent,
    BulkUrlDetectorComponent,
    TokenExpiredComponent,
    ForgotPasswordComponent,
    FaqComponent,
    UrlFeedbackComponent,
    UserFeedbackComponent,
    CustomGraphComponent,
    ManagerUserComponent,
    BlogComponent,
    ManageBlogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    NgMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [
    {  
      provide:HTTP_INTERCEPTORS, useClass:BasicAuthHttpInterceptor, multi:true 
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
