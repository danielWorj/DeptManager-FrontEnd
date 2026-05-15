import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ScolariteService } from '../../../../Core/Service/Scolarite/scolarite-service';
import { AnneeAcademique } from '../../../../Core/Model/Scolarite/anneeacademique';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-annee',
  imports: [ReactiveFormsModule],
  templateUrl: './annee.html',
  styleUrl: './annee.css',
})
export class Annee {
  anneeForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder, private scolariteService: ScolariteService) {
    this.anneeForm = this.fb.group({
      id: new FormControl(null),
      intitule: new FormControl(''),
      status: new FormControl(false),
    });

    this.loadPage();
  }

  loadPage() {
    this.getAllAnneeAcademique();
  }

  listAnnee = signal<AnneeAcademique[]>([]);

  getAllAnneeAcademique() {
    this.isLoading.set(true);
    this.scolariteService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => {
        this.listAnnee.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        console.log('fetch AnneeAcademique : failed');
        this.isLoading.set(false);
        this.showError('Erreur lors du chargement des années académiques.');
      },
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.anneeForm.reset({ id: null, intitule: '', status: false });
    this.clearMessages();
  }

  openEditModal(annee: AnneeAcademique) {
    this.isEditMode.set(true);
    this.clearMessages();
    this.anneeForm.patchValue({
      id: annee.id,
      intitule: annee.intitule,
      status: annee.status,
    });
  }

  saveAnnee() {
    if (this.isEditMode()) {
      this.updateAnneeAcademique();
    } else {
      this.createAnneeAcademique();
    }
  }

  createAnneeAcademique() {
    const formData: FormData = new FormData();
    formData.append('annee', JSON.stringify(this.anneeForm.value));

    this.scolariteService.createAnneeAcademique(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          console.log('création AnneeAcademique : ok');
          this.getAllAnneeAcademique();
          this.anneeForm.reset();
          this.showSuccess('Année académique créée avec succès.');
        }
      },
      error: () => {
        console.log('création AnneeAcademique : failed');
        this.showError('Erreur lors de la création.');
      },
    });
  }

  updateAnneeAcademique() {
    const formData: FormData = new FormData();
    formData.append('annee', JSON.stringify(this.anneeForm.value));

    this.scolariteService.updateAnneeAcademique(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          console.log('mise à jour AnneeAcademique : ok');
          this.getAllAnneeAcademique();
          this.anneeForm.reset();
          this.showSuccess('Année académique mise à jour avec succès.');
        }
      },
      error: () => {
        console.log('mise à jour AnneeAcademique : failed');
        this.showError('Erreur lors de la mise à jour.');
      },
    });
  }

  deleteAnneeAcademique(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette année académique ?')) return;

    this.scolariteService.deleteAnneeAcademique(id).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          console.log('suppression AnneeAcademique : ok');
          this.getAllAnneeAcademique();
          this.showSuccess('Année académique supprimée.');
        }
      },
      error: () => {
        console.log('suppression AnneeAcademique : failed');
        this.showError('Erreur lors de la suppression.');
      },
    });
  }

  activeAnneeAcademique(id: number) {
    this.scolariteService.activeAnneeAcademique(id).subscribe({
      next: (data: ResponseServer) => {
        if (data) {
          console.log('activation AnneeAcademique : ok');
          this.getAllAnneeAcademique();
          this.showSuccess('Année académique activée avec succès.');
        }
      },
      error: () => {
        console.log('activation AnneeAcademique : failed');
        this.showError("Erreur lors de l'activation.");
      },
    });
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    this.errorMessage.set(null);
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    this.successMessage.set(null);
    setTimeout(() => this.errorMessage.set(null), 4000);
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}