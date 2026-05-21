import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../Core/Service/Auth/auth-service';
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { BasicAuthData } from '../../../../Core/Model/Utilisateur/BasicAuthData';

declare const bootstrap: any; // Bootstrap est chargé globalement dans le projet

type Step = 'idle' | 'confirm-reset' | 'verify-pwd' | 'confirm-final' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-data-base',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './data-base.html',
  styleUrl: './data-base.css',
})
export class DataBase {

  // ─── Signaux d'état ───────────────────────────────────────────────
  step        = signal<Step>('idle');
  authError   = signal<string | null>(null);
  resetError  = signal<string | null>(null);
  isVerifying = signal(false);
  showPassword = signal(false);

  // ─── Formulaire ───────────────────────────────────────────────────
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  // ─── Helpers modals Bootstrap ────────────────────────────────────
  private openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) bootstrap.Modal.getOrCreateInstance(el).show();
  }

  private closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) bootstrap.Modal.getInstance(el)?.hide();
  }

  // ─── Étape 2 : Vérification du mot de passe ──────────────────────
  verifierMotDePasse(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const sessionId   = Number(localStorage.getItem('id'));
    const sessionRole = Number(localStorage.getItem('role'));

    if (!sessionId) {
      this.authError.set('Session invalide. Veuillez vous reconnecter.');
      return;
    }

    this.isVerifying.set(true);
    this.authError.set(null);

    const formData : FormData = new FormData(); 

    formData.append("auth", JSON.stringify(this.passwordForm.value));

    this.authService.basicLoginWithPwd(formData).subscribe({
      next: (response: BasicAuthData) => {
        this.isVerifying.set(false);

        if (response.id === sessionId && response.role === sessionRole) {
          // Identité validée → fermer modal 2, ouvrir modal 3
          this.closeModal('verifyPasswordModal');
          this.openModal('confirmFinalModal');
          this.step.set('confirm-final');
        } else {
          this.authError.set('Identité non correspondante. Accès refusé.');
        }
      },
      error: () => {
        this.isVerifying.set(false);
        this.authError.set('Mot de passe incorrect ou utilisateur introuvable.');
      },
    });
  }

  // ─── Étape 3 : Lancer le reset ────────────────────────────────────
  lancerReset(): void {
    this.closeModal('confirmFinalModal');
    this.step.set('loading');
    this.openModal('resultModal');
    this.resetError.set(null);

    this.configService.resetDatabase().subscribe({
      next: () => {
        this.step.set('success');
      },
      error: () => {
        this.resetError.set('Une erreur est survenue lors de la réinitialisation.');
        this.step.set('error');
      },
    });
  }

  // ─── Réessayer depuis le modal résultat ──────────────────────────
  // (appelle directement lancerReset qui gère l'état loading)

  // ─── Fermer / reset global ────────────────────────────────────────
  fermer(): void {
    this.step.set('idle');
    this.authError.set(null);
    this.resetError.set(null);
    this.passwordForm.reset();
    this.isVerifying.set(false);
    this.showPassword.set(false);
  }

  // ─── Toggle visibilité mot de passe ──────────────────────────────
  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  get passwordControl() {
    return this.passwordForm.get('password');
  }
}