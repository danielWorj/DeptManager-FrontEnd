import {
  Component,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { ConfigService }    from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';

import { Matiere }       from '../../../Core/Model/Scolarite/Matiere';
import { Filiere }       from '../../../Core/Model/Structure/Filiere';
import { Niveau }        from '../../../Core/Model/Structure/Niveau';
import { Enseignant }    from '../../../Core/Model/Utilisateur/Enseignant';
import { Semestre }      from '../../../Core/Model/Scolarite/Semestre';
import { Repartition }   from '../../../Core/Model/Scolarite/Repartition';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-repartition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './repartition.html',
  styleUrl: './repartition.css',
})
export class RepartitionC implements OnInit {

  //  Formulaire réactif 
  repartitionForm!: FormGroup;

  //  Signals : listes de référence 
  listMatiere    = signal<Matiere[]>([]);
  listFiliere    = signal<Filiere[]>([]);
  listNiveau     = signal<Niveau[]>([]);
  listEnseignant = signal<Enseignant[]>([]);
  listSemestre   = signal<Semestre[]>([]);
  listRepartition = signal<Repartition[]>([]);

  //  Signals : états UI 
  isLoading   = signal(false);
  isSaving    = signal(false);
  formError   = signal<string | null>(null);
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType    = signal<'success' | 'danger'>('success');

  //  Filtres 
  filterFiliere  : Filiere  | null = null;
  filterNiveau   : Niveau   | null = null;
  filterSemestre : Semestre | null = null;
  filterOpen = true;
  tableVisible = false;
  searchQuery = '';

  //  Modals 
  showCreateModal = false;
  showViewModal   = false;
  showDeleteModal = false;
  isEditMode      = false;
  selectedRepartition: Repartition | null = null;

  //  Computed 

  /** Répartitions filtrées localement par la recherche rapide */
  filteredRepartitions = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.listRepartition();
    return this.listRepartition().filter(r =>
      r.matiere?.intitule?.toLowerCase().includes(q)      ||
      r.enseignant?.nom?.toLowerCase().includes(q)       ||
      r.enseignant?.prenom?.toLowerCase().includes(q)    ||
      r.filiere?.intitule?.toLowerCase().includes(q)      ||
      r.niveau?.intitule?.toLowerCase().includes(q)       ||
      r.semestre?.intitule?.toLowerCase().includes(q)
    );
  });

  hasActiveFilters = computed(() =>
    !!this.filterFiliere || !!this.filterNiveau || !!this.filterSemestre
  );

  activeFilterCount = computed(() => {
    let c = 0;
    if (this.filterFiliere)  c++;
    if (this.filterNiveau)   c++;
    if (this.filterSemestre) c++;
    return c;
  });

  //  Constructeur 
  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private configService:      ConfigService,
    private scolariteService:   ScolariteService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPage();
  }

  //  Initialisation 
  private buildForm(): void {
    this.repartitionForm = this.fb.group({
      id:          new FormControl<number | null>(null),
      enseignant:  new FormControl<Enseignant  | null>(null, Validators.required),
      filiere:     new FormControl<Filiere     | null>(null, Validators.required),
      niveau:      new FormControl<Niveau      | null>(null, Validators.required),
      matiere:     new FormControl<Matiere     | null>(null, Validators.required),
      semestre:    new FormControl<Semestre    | null>(null, Validators.required),
    });
  }

  loadPage(): void {
    this.getAllFiliere();
    this.getAllNiveau();
    this.getAllMatiere();
    this.getAllEnseignant();
    this.getAllSemestre();
  }

  //  Chargement données 
  getAllMatiere(): void {
    this.scolariteService.getAllMatiere().subscribe({
      next:  (data: Matiere[]) => this.listMatiere.set(data),
      error: (err) => { console.error('Erreur list matiere', err); },
    });
  }

  getAllFiliere(): void {
    this.configService.getAllFiliere().subscribe({
      next:  (data: Filiere[]) => this.listFiliere.set(data),
      error: (err) => { console.error('Erreur list Filiere', err); },
    });
  }

  getAllNiveau(): void {
    this.configService.getAllNiveau().subscribe({
      next:  (data: Niveau[]) => this.listNiveau.set(data),
      error: (err) => { console.error('Erreur list Niveau', err); },
    });
  }

  getAllEnseignant(): void {
    this.utilisateurService.getAllEnseignant().subscribe({
      next:  (data: Enseignant[]) => this.listEnseignant.set(data),
      error: (err) => { console.error('Erreur list Enseignant', err); },
    });
  }

  getAllSemestre(): void {
    this.scolariteService.getAllSemestre().subscribe({
      next:  (data: Semestre[]) => this.listSemestre.set(data),
      error: (err) => { console.error('Erreur list semestre', err); },
    });
  }

  //  Récupération répartitions 
  getAllRepartitionByFiliereAndNiveau(idF: number, idN: number): void {
    this.isLoading.set(true);
    this.scolariteService.getAllRepartitionByFiliereAndNiveau(idF, idN).subscribe({
      next:  (data: Repartition[]) => {
        this.listRepartition.set(data);
        this.tableVisible = true;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur list repartition by filiere/niveau', err);
        this.showToast('Erreur lors du chargement des répartitions.', 'danger');
        this.isLoading.set(false);
      },
    });
  }

  getAllRepartitionByFiliereAndNiveauAndSemestre(idF: number, idN: number, idS: number): void {
    this.isLoading.set(true);
    this.scolariteService.getAllRepartitionByFiliereAndNiveauAndSemestre(idF, idN, idS).subscribe({
      next:  (data: Repartition[]) => {
        this.listRepartition.set(data);
        this.tableVisible = true;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur list repartition filiere/niveau/semestre', err);
        this.showToast('Erreur lors du chargement des répartitions.', 'danger');
        this.isLoading.set(false);
      },
    });
  }

  //  CRUD 
  createRepartition(): void {
    const formData = new FormData();
    formData.append('repartition', JSON.stringify(this.repartitionForm.value));

    this.scolariteService.createRepartition(formData).subscribe({
      next: (data: ResponseServer) => {
        this.isSaving.set(false);
        this.closeCreateModal();
        this.showToast('Répartition créée avec succès.');
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur création répartition', err);
        this.formError.set('Une erreur est survenue lors de la création.');
        this.isSaving.set(false);
      },
    });
  }

  updateRepartition(): void {
    const formData = new FormData();
    formData.append('repartition', JSON.stringify(this.repartitionForm.value));

    this.scolariteService.updateRepartition(formData).subscribe({
      next: (data: ResponseServer) => {
        this.isSaving.set(false);
        this.closeCreateModal();
        this.showToast('Répartition mise à jour avec succès.');
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur mise à jour répartition', err);
        this.formError.set('Une erreur est survenue lors de la mise à jour.');
        this.isSaving.set(false);
      },
    });
  }

  deleteRepartition(id: number): void {
    this.scolariteService.deleteRepartition(id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeDeleteModal();
        this.showToast('Répartition supprimée avec succès.');
        // Retrait optimiste de la liste locale
        this.listRepartition.update(list => list.filter(r => r.id !== id));
      },
      error: (err) => {
        console.error('Erreur suppression répartition', err);
        this.formError.set('Impossible de supprimer cette répartition.');
        this.isSaving.set(false);
      },
    });
  }

  //  Soumission du formulaire 
  submitRepartition(): void {
    this.repartitionForm.markAllAsTouched();
    if (this.repartitionForm.invalid) return;

    this.isSaving.set(true);
    this.formError.set(null);

    if (this.isEditMode) {
      this.updateRepartition();
    } else {
      this.createRepartition();
    }
  }

  //  Validation 
  isFieldInvalid(field: string): boolean {
    const ctrl = this.repartitionForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  //  Gestion des filtres 
  toggleFilters(): void {
    this.filterOpen = !this.filterOpen;
  }

  onFiliereChange(filiere: Filiere | null): void {
    this.filterFiliere = filiere;
    // Réinitialiser les filtres dépendants
    if (!filiere) {
      this.filterNiveau   = null;
      this.filterSemestre = null;
      this.tableVisible   = false;
      this.listRepartition.set([]);
    }
  }

  onNiveauChange(niveau: Niveau | null): void {
    this.filterNiveau = niveau;
    if (!niveau) {
      this.filterSemestre = null;
      this.tableVisible   = false;
      this.listRepartition.set([]);
    }
  }

  onSemestreChange(semestre: Semestre | null): void {
    this.filterSemestre = semestre;
  }

  applyFilters(): void {
    if (!this.filterFiliere || !this.filterNiveau) return;

    this.searchQuery = '';
    if (this.filterSemestre) {
      this.getAllRepartitionByFiliereAndNiveauAndSemestre(
        this.filterFiliere.id,
        this.filterNiveau.id,
        this.filterSemestre.id,
      );
    } else {
      this.getAllRepartitionByFiliereAndNiveau(
        this.filterFiliere.id,
        this.filterNiveau.id,
      );
    }
  }

  resetFilters(): void {
    this.filterFiliere  = null;
    this.filterNiveau   = null;
    this.filterSemestre = null;
    this.tableVisible   = false;
    this.searchQuery    = '';
    this.listRepartition.set([]);
  }

  clearFilter(type: 'filiere' | 'niveau' | 'semestre'): void {
    if (type === 'filiere') {
      this.filterFiliere  = null;
      this.filterNiveau   = null;
      this.filterSemestre = null;
      this.tableVisible   = false;
      this.listRepartition.set([]);
    } else if (type === 'niveau') {
      this.filterNiveau   = null;
      this.filterSemestre = null;
      this.tableVisible   = false;
      this.listRepartition.set([]);
    } else {
      this.filterSemestre = null;
      // Re-charger sans filtre semestre si filiere+niveau présents
      if (this.filterFiliere && this.filterNiveau) {
        this.getAllRepartitionByFiliereAndNiveau(
          this.filterFiliere.id,
          this.filterNiveau.id,
        );
      }
    }
  }

  onSearchChange(): void {
    // Déclenché via ngModelChange : le computed se recalcule automatiquement
  }

  /** Actualise le tableau selon les filtres courants */
  private refreshTable(): void {
    if (this.filterFiliere && this.filterNiveau) {
      this.applyFilters();
    }
  }

  //  Gestion des modals 
  openCreateModal(): void {
    this.isEditMode = false;
    this.formError.set(null);
    this.repartitionForm.reset();
    this.showCreateModal = true;
  }

  openEditModal(r: Repartition): void {
    this.isEditMode = true;
    this.formError.set(null);
    this.selectedRepartition = r;
    this.repartitionForm.patchValue({
      id:         r.id,
      enseignant: r.enseignant,
      filiere:    r.filiere,
      niveau:     r.niveau,
      matiere:    r.matiere,
      semestre:   r.semestre,
    });
    this.showCreateModal = true;
  }

  openViewModal(r: Repartition): void {
    this.selectedRepartition = r;
    this.showViewModal = true;
  }

  openDeleteModal(r: Repartition): void {
    this.selectedRepartition = r;
    this.formError.set(null);
    this.showDeleteModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.repartitionForm.reset();
    this.formError.set(null);
  }

  closeViewModal(): void {
    this.showViewModal = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.formError.set(null);
  }

  switchToEdit(): void {
    if (!this.selectedRepartition) return;
    this.closeViewModal();
    this.openEditModal(this.selectedRepartition);
  }

  confirmDelete(): void {
    if (!this.selectedRepartition?.id) return;
    this.isSaving.set(true);
    this.formError.set(null);
    this.deleteRepartition(this.selectedRepartition.id);
  }

  /** Ferme la modal si clic sur l'overlay (pas sur le contenu) */
  onOverlayClick(event: MouseEvent, type: 'create' | 'view' | 'delete'): void {
    if ((event.target as HTMLElement).classList.contains('rpart-modal-overlay')) {
      if (type === 'create') this.closeCreateModal();
      if (type === 'view')   this.closeViewModal();
      if (type === 'delete') this.closeDeleteModal();
    }
  }

  //  Toast 
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string, type: 'success' | 'danger' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  //  Helpers visuels 
  private readonly AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#696cff,#9597ff)',
    'linear-gradient(135deg,#28c76f,#48da89)',
    'linear-gradient(135deg,#ff9f43,#ffb976)',
    'linear-gradient(135deg,#ea5455,#ff7c7c)',
    'linear-gradient(135deg,#7367f0,#9e95f5)',
    'linear-gradient(135deg,#00cfe8,#1ce7ff)',
  ];

  avatarColor(nom: string): string {
    let hash = 0;
    for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    return this.AVATAR_GRADIENTS[Math.abs(hash) % this.AVATAR_GRADIENTS.length];
  }

  initials(nom?: string, prenom?: string): string {
    const n = (nom?.[0] ?? '').toUpperCase();
    const p = (prenom?.[0] ?? '').toUpperCase();
    return p + n || '?';
  }
}