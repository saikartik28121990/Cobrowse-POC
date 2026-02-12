import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login';
import { DashboardComponent } from './dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, DashboardComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('user');
  }

  onLoginSuccess() {
    this.isLoggedIn = true;
  }

  onLogout() {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
  }
}
