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

import { ScolariteService }   from '../../../Core/Service/Scolarite/scolarite-service';
import { ConfigService }      from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';

import { Matiere }         from '../../../Core/Model/Scolarite/Matiere';
import { Filiere }         from '../../../Core/Model/Structure/Filiere';
import { Niveau }          from '../../../Core/Model/Structure/Niveau';
import { Enseignant }      from '../../../Core/Model/Utilisateur/Enseignant';
import { Semestre }        from '../../../Core/Model/Scolarite/Semestre';
import { Repartition }     from '../../../Core/Model/Scolarite/Repartition';
import { ResponseServer }  from '../../../Core/Model/Server/ResponseServer';
import { AnneeAcademique } from '../../../Core/Model/Scolarite/anneeacademique';
import { Departement } from '../../../Core/Model/Structure/Departement';

@Component({
  selector: 'app-repartition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './repartition.html',
  styleUrl: './repartition.css',
})
export class RepartitionC implements OnInit {

  // ── Formulaire réactif ────────
  repartitionForm!: FormGroup;

  // ── Signals : listes de référence 
  listMatiere         = signal<Matiere[]>([]);
  listDepartement         = signal<Departement[]>([]);
  listFiliere         = signal<Filiere[]>([]);
  listNiveau          = signal<Niveau[]>([]);
  listEnseignant      = signal<Enseignant[]>([]);
  listSemestre        = signal<Semestre[]>([]);
  listAnneeAcademique = signal<AnneeAcademique[]>([]);   // ← NOUVEAU
  listRepartition     = signal<Repartition[]>([]);

  /** Semestres affichés dans le panneau de filtres (filtrés par année académique du filtre) */
  listSemestreFiltered = signal<Semestre[]>([]);

  /** Semestres affichés dans le formulaire modal (filtrés par année académique du formulaire) */
  listSemestreForm = signal<Semestre[]>([]);
  listFiliereForm = signal<Filiere[]>([]);

  // ── Signals : états UI ───────
  isLoading    = signal(false);
  isSaving     = signal(false);
  formError    = signal<string | null>(null);
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType    = signal<'success' | 'danger'>('success');

  // ── Filtres ─
  filterFiliere         : Filiere         | null = null;
  filterNiveau          : Niveau          | null = null;
  filterAnneeAcademique : AnneeAcademique | null = null;  // ← NOUVEAU
  filterSemestre        : Semestre        | null = null;

  // Filtres avec id 
  idFiliereFilter = 0 ; 
  idNiveauFilter = 0; 
  idAnneeAcademiqueFilter = 0; 
  idSemestreFilter = 0; 


  filterOpen   = true;
  tableVisible = false;
  searchQuery  = '';

  // ── Modals ──
  showCreateModal = false;
  showViewModal   = false;
  showDeleteModal = false;
  isEditMode      = false;
  selectedRepartition: Repartition | null = null;

  // ── Computed 

  filteredRepartitions = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.listRepartition();
    return this.listRepartition().filter(r =>
      r.matiere?.intitule?.toLowerCase().includes(q)                      ||
      r.enseignant?.nom?.toLowerCase().includes(q)                        ||
      r.enseignant?.prenom?.toLowerCase().includes(q)                     ||
      r.filiere?.intitule?.toLowerCase().includes(q)                      ||
      r.niveau?.intitule?.toLowerCase().includes(q)                       ||
      r.semestre?.intitule?.toLowerCase().includes(q)                     ||
      r.semestre?.anneeAcademique?.intitule?.toLowerCase().includes(q)
    );
  });

  hasActiveFilters = computed(() =>
    !!this.filterFiliere || !!this.filterNiveau ||
    !!this.filterAnneeAcademique || !!this.filterSemestre
  );

  activeFilterCount = computed(() => {
    let c = 0;
    if (this.filterFiliere)         c++;
    if (this.filterNiveau)          c++;
    if (this.filterAnneeAcademique) c++;
    if (this.filterSemestre)        c++;
    return c;
  });

  // ── Constructeur ─────────────
  constructor(
    private fb:                 FormBuilder,
    private utilisateurService: UtilisateurService,
    private configService:      ConfigService,
    private scolariteService:   ScolariteService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPage();
  }

  // ── Initialisation ───────────
  private buildForm(): void {
    this.repartitionForm = this.fb.group({
      id:              new FormControl<number          | null>(null),
      enseignant:      new FormControl<Enseignant      | null>(null, Validators.required),
      filiere:         new FormControl<Filiere         | null>(null, Validators.required),
      niveau:          new FormControl<Niveau          | null>(null, Validators.required),
      matiere:         new FormControl<Matiere         | null>(null, Validators.required),
      anneeAcademique: new FormControl<AnneeAcademique | null>(null, Validators.required), // ← NOUVEAU
      semestre:        new FormControl<Semestre        | null>(null, Validators.required),
    });
  }

  loadPage(): void {
    this.getAllDepartement(); 
    this.getAllFiliere();
    this.getAllNiveau();
    this.getAllMatiere();
    this.getAllEnseignant();
    this.getAllSemestre();
    this.getAllAnneeAcademique(); // ← NOUVEAU
  }

  // ── Chargement données ───────
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

  getAllDepartement(): void {
    this.configService.getAllDepartement().subscribe({
      next:  (data: Departement[]) => this.listDepartement.set(data),
      error: (err) => { console.error('Erreur list departement', err); },
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
      next:  (data: Semestre[]) => {
        this.listSemestre.set(data);
        // Initialiser les deux listes dérivées avec l'ensemble complet
        this.listSemestreFiltered.set(data);
        this.listSemestreForm.set(data);
      },
      error: (err) => { console.error('Erreur list semestre', err); },
    });
  }

  /** NOUVEAU — charge toutes les années académiques */
  getAllAnneeAcademique(): void {
    this.configService.getAllAnneeAcademique().subscribe({
      next:  (data: AnneeAcademique[]) => this.listAnneeAcademique.set(data),
      error: (err) => { console.error('Erreur list anneeAcademique', err); },
    });
  }

  // ── Récupération répartitions 
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

  // ── CRUD ────
  createRepartition(): void {
    const formData = new FormData();
    formData.append('repartition', JSON.stringify(this.repartitionForm.value));

    this.scolariteService.createRepartition(formData).subscribe({
      next: (_data: ResponseServer) => {
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
      next: (_data: ResponseServer) => {
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
        this.listRepartition.update(list => list.filter(r => r.id !== id));
      },
      error: (err) => {
        console.error('Erreur suppression répartition', err);
        this.formError.set('Impossible de supprimer cette répartition.');
        this.isSaving.set(false);
      },
    });
  }

  // ── Soumission du formulaire ─
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

  // ── Validation ───────────────
  isFieldInvalid(field: string): boolean {
    const ctrl = this.repartitionForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  // ── Gestion des filtres ──────
  toggleFilters(): void {
    this.filterOpen = !this.filterOpen;
  }

  onFiliereChange(f: Event): void {
    let filiereID = Number((f.target as HTMLSelectElement).value) ; 

    if (filiereID!=0) {
      this.idFiliereFilter = Number((f.target as HTMLSelectElement).value) ; 
      console.log('l id de la filiere est :'+filiereID); 
      this.tableVisible = false;
      this.listRepartition.set([]);
    }
  }

  onNiveauChange(n: Event): void {
     let niveauID = Number((n.target as HTMLSelectElement).value) ; 

    if (niveauID!=0) {
      this.idNiveauFilter = Number((n.target as HTMLSelectElement).value) ; 
      console.log('l id du niveaue est :'+niveauID); 
      this.tableVisible = false;
      this.listRepartition.set([]);
    }
  }

  /** NOUVEAU — met à jour la liste de semestres filtrés selon l'année sélectionnée dans les filtres */
  onAnneeAcademiqueChange(a:Event): void {
    
     let anneeID = Number((a.target as HTMLSelectElement).value) ; 

    if (anneeID!=0) {
      this.idAnneeAcademiqueFilter = Number((a.target as HTMLSelectElement).value) ; 
      console.log('l id de l anee st :'+this.idAnneeAcademiqueFilter); 
      this.tableVisible = false;
      this.listRepartition.set([]);

      this.listSemestreFiltered.set(
        this.listSemestre().filter(s => s.anneeAcademique?.id === this.idAnneeAcademiqueFilter)
      );
    }

  }



  onSemestreChange(s:Event): void {
    //this.filterSemestre!.id= Number((s.target as HTMLSelectElement).value)  ;
    this.idSemestreFilter = Number((s.target as HTMLSelectElement).value) ; 
    console.log('l id du semestre selectionne est :'+ this.idSemestreFilter);
  }

  applyFilters(): void {

     console.log('semestre :'+this.idSemestreFilter);
      console.log('niveau :'+this.idNiveauFilter);
      console.log('filiere :'+this.idFiliereFilter);

    if (this.idSemestreFilter ==0  || this.idNiveauFilter ==0) return;

    this.searchQuery = '';
  
    if (this.idSemestreFilter !=0) {
      console.log('semestre :'+this.idSemestreFilter);
      console.log('niveau :'+this.idNiveauFilter);
      console.log('filiere :'+this.idFiliereFilter);

      this.getAllRepartitionByFiliereAndNiveauAndSemestre(
        this.idFiliereFilter,
        this.idNiveauFilter,
        this.idSemestreFilter,
      );
    } else {
      this.getAllRepartitionByFiliereAndNiveau(
        this.idFiliereFilter,
        this.idNiveauFilter,
      );
    }
  }

  resetFilters(): void {
    this.filterFiliere         = null;
    this.filterNiveau          = null;
    this.filterAnneeAcademique = null;
    this.filterSemestre        = null;
    this.tableVisible          = false;
    this.searchQuery           = '';
    this.listRepartition.set([]);
    this.listSemestreFiltered.set(this.listSemestre());
  }

  clearFilter(type: 'filiere' | 'niveau' | 'anneeAcademique' | 'semestre'): void {
    switch (type) {
      case 'filiere':
        this.filterFiliere         = null;
        this.filterNiveau          = null;
        this.filterAnneeAcademique = null;
        this.filterSemestre        = null;
        this.listSemestreFiltered.set(this.listSemestre());
        this.tableVisible = false;
        this.listRepartition.set([]);
        break;

      case 'niveau':
        this.filterNiveau          = null;
        this.filterAnneeAcademique = null;
        this.filterSemestre        = null;
        this.listSemestreFiltered.set(this.listSemestre());
        this.tableVisible = false;
        this.listRepartition.set([]);
        break;

      case 'anneeAcademique':
        this.filterAnneeAcademique = null;
        this.filterSemestre        = null;
        this.listSemestreFiltered.set(this.listSemestre());
        if (this.filterFiliere && this.filterNiveau) {
          this.getAllRepartitionByFiliereAndNiveau(
            this.filterFiliere.id,
            this.filterNiveau.id,
          );
        }
        break;

      case 'semestre':
        this.filterSemestre = null;
        if (this.filterFiliere && this.filterNiveau) {
          this.getAllRepartitionByFiliereAndNiveau(
            this.filterFiliere.id,
            this.filterNiveau.id,
          );
        }
        break;
    }
  }

  onSearchChange(): void {
    // Le computed se recalcule automatiquement
  }

  private refreshTable(): void {
    if (this.filterFiliere && this.filterNiveau) {
      this.applyFilters();
    }
  }

  // ── Gestion des modals ───────
  openCreateModal(): void {
    this.isEditMode = false;
    this.formError.set(null);
    this.repartitionForm.reset();
    this.listSemestreForm.set(this.listSemestre());
    this.showCreateModal = true;
  }

  openEditModal(r: Repartition): void {
    this.isEditMode = true;
    this.formError.set(null);
    this.selectedRepartition = r;

    // Pré-charger les semestres de l'année associée à la répartition
    const annee = r.semestre?.anneeAcademique ?? null;
    this.listSemestreForm.set(
      annee
        ? this.listSemestre().filter(s => s.anneeAcademique?.id === annee.id)
        : this.listSemestre()
    );

    this.repartitionForm.patchValue({
      id:              r.id,
      enseignant:      r.enseignant,
      filiere:         r.filiere,
      niveau:          r.niveau,
      matiere:         r.matiere,
      anneeAcademique: annee,
      semestre:        r.semestre,
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
    this.listSemestreForm.set(this.listSemestre());
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

  /** NOUVEAU — met à jour la liste de semestres dans le formulaire modal */
  onFormAnneeChange(annee: AnneeAcademique | null): void {
    // Réinitialiser le semestre car il dépend de l'année
    this.repartitionForm.patchValue({ semestre: null });

    if (!annee) {
      this.listSemestreForm.set(this.listSemestre());
    } else {
      this.listSemestreForm.set(
        this.listSemestre().filter(s => s.anneeAcademique?.id === annee.id)
      );
    }
  }

  // ── Toast ───
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string, type: 'success' | 'danger' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  // ── Helpers visuels ──────────
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
    const n = (nom?.[0]    ?? '').toUpperCase();
    const p = (prenom?.[0] ?? '').toUpperCase();
    return p + n || '?';
  }

  closeDetail(): void {}

  filterSemestreByAnnee(e:Event){
    const idA = Number((e.target as HTMLSelectElement).value);

    console.log('id de lannee :'+idA);
    
     this.listSemestre.set(
      this.listSemestre().filter(s => s.anneeAcademique.id === idA)
    );
  }
  filteredDataToForm(event : Event){
    const idD = Number((event.target as HTMLSelectElement).value);

    console.log('id du departement :'+idD);
    
     this.listFiliere.set(
      this.listFiliereForm().filter(f => f.departement!.id === idD)
    );
  
    this.listMatiere.set(
      this.listMatiere().filter(m => m.departement!.id === idD)
    );

    this.listEnseignant.set(
      this.listEnseignant().filter(e => e.departement!.id === idD)
    );
  }


  filterSemestreForm(e:Event){
    const idA = Number((e.target as HTMLSelectElement).value);

    this.listSemestreForm.set(
      this.listSemestre().filter(s => s.anneeAcademique!.id === idA)
    );
  }

}