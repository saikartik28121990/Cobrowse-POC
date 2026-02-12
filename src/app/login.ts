import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  email = '';
  password = '';
  message = '';
  loading = false;

  async handleSubmit() {
    this.message = '';

    // Manual validation (no disabled-button UX)
    if (!this.email.trim() || !this.password.trim()) {
      this.message = 'Please enter both username and password.';
      return;
    }

    this.loading = true;

    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        this.loginSuccess.emit();
      } else {
        this.message = 'Invalid username or password.';
      }
    } catch (error) {
      console.error(error);
      this.message = 'Server error. Please try again later.';
    } finally {
      this.loading = false;
    }
  }
}
