// auth.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../Core/Service/Auth/auth-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BasicAuthData } from '../../../Core/Model/Utilisateur/BasicAuthData';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // ← ajout

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {

  @Output() statut = new EventEmitter<boolean>();
  authForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,           // ← ajout
    private route: ActivatedRoute     // ← ajout
  ) {
    this.authForm = this.fb.group({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  login(): void {
    this.isLoading = true;

    const formData: FormData = new FormData();
    formData.append('auth', JSON.stringify(this.authForm.value));


    this.authService.basicLogin(formData).subscribe({
      next: (data: BasicAuthData) => {
        this.isLoading = false;
        if (data.id != 0) {
          console.log('Connexion réussie', data);
          this.statut.emit(true);
          localStorage.setItem('id', `${data.id}`);
          localStorage.setItem('role', `${data.role}`);

          // ← Lecture du returnUrl + sécurité Open Redirect
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          console.log('Return URL:', returnUrl);
          const safeUrl = returnUrl?.startsWith('/') ? returnUrl : '/admin/admin-dashboard';
          this.router.navigateByUrl(safeUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur de connexion', err);
      }
    });
  }
}