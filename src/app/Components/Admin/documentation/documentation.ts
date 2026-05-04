import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Documentation } from '../../../Core/Model/Scolarite/Document';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Departement } from '../../../Core/Model/Structure/Departement';
import { TypeDocument } from '../../../Core/Model/Scolarite/TypeDocument';
import { Matiere } from '../../../Core/Model/Scolarite/Matiere';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { AnneeAcademique } from '../../../Core/Model/Scolarite/anneeacademique';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

// ─── Composant 

@Component({
  selector: 'app-documentation',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class DocumentationC implements OnInit {

  // ── Formulaire ───────
  documentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private scolariteService: ScolariteService,
    private utilisateurService : UtilisateurService, 
    private configService: ConfigService,
  ) {
    this.documentForm = this.fb.group({
      id:              new FormControl(null),
      url:             new FormControl(''),
      dateC:           new FormControl('', Validators.required),
      typeDocument:    new FormControl('', Validators.required),
      matiere:         new FormControl('', Validators.required),
      departement:     new FormControl('', Validators.required),
      filiere:         new FormControl('', Validators.required),
      niveau:          new FormControl('', Validators.required),
      anneeAcademique: new FormControl('', Validators.required),
      enseignant:      new FormControl(''),
    });
  }

  // ── Listes de données ─
  listDocument        = signal<Documentation[]>([]);
  listDocumentSave    = signal<Documentation[]>([]);
  listFiliere         = signal<Filiere[]>([]);
  listNiveau          = signal<Niveau[]>([]);
  listDepartement     = signal<Departement[]>([]);
  listFiliereFiltered = signal<Filiere[]>([]);
  listMatiere         = signal<Matiere[]>([]);
  listEnseignant      = signal<Enseignant[]>([]);
  listAnneeAcademique = signal<AnneeAcademique[]>([]);
  listTypeDocument    = signal<TypeDocument[]>([]);

  // ── Détail sélectionné 
  selectedDocument = signal<Documentation | null>(null);

  // ── État UI 
  showModal     = signal<boolean>(false);
  isSubmitting  = signal<boolean>(false);
  submitSuccess = signal<boolean>(false);
  submitError   = signal<boolean>(false);
  activeType    = signal<number | null>(null); // null = "Tous"

  // 
  // INIT
  // 
  ngOnInit(): void {
    this.getAllDocument();
    this.getAllDepartement();
    this.getAllFiliere();
    this.getAllNiveau();
    this.getAllMatiere();
    this.getAllEnseignant();
    this.getAllAnneeAcademique();
    this.getAllTypeDocument();
  }

  // 
  // FETCHES
  // 
  getAllDocument(): void {
    this.scolariteService.getAllDocument().subscribe({
      next: (data: Documentation[]) => {
        this.listDocument.set(data);
        this.listDocumentSave.set(data);
      },
      error: () => console.error('Fetch list document : failed'),
    });
  }

  getAllDepartement(): void {
    this.configService.getAllDepartement().subscribe({
      next: (data: Departement[]) => this.listDepartement.set(data),
      error: () => console.error('Fetch list departement : failed'),
    });
  }

  getAllFiliere(): void {
    this.configService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => {
        this.listFiliere.set(data);
        this.listFiliereFiltered.set(data);
      },
      error: () => console.error('Fetch list filiere : failed'),
    });
  }

  getAllNiveau(): void {
    this.configService.getAllNiveau().subscribe({
      next: (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.error('Fetch list niveau : failed'),
    });
  }

  getAllMatiere(): void {
    this.scolariteService.getAllMatiere().subscribe({
      next: (data: Matiere[]) => {
        console.log('Affichage de la liste des matiere')
        this.listMatiere.set(data)
        
      },
      error: () => console.error('Fetch list matiere : failed'),
    });
  }

  getAllEnseignant(): void {
    this.utilisateurService.getAllEnseignant().subscribe({
      next: (data: Enseignant[]) => this.listEnseignant.set(data),
      error: () => console.error('Fetch list enseignant : failed'),
    });
  }

  getAllAnneeAcademique(): void {
    this.configService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => this.listAnneeAcademique.set(data),
      error: () => console.error('Fetch list anneeAcademique : failed'),
    });
  }

  getAllTypeDocument(): void {
    this.configService.getAllTypeDocument().subscribe({
      next: (data: TypeDocument[]) => this.listTypeDocument.set(data),
      error: () => console.error('Fetch list typeDocument : failed'),
    });
  }

  // 
  // FILTRES
  // 

  /** Filtre par type via les badges (null = tous) */
  filterByType(idType: number | null): void {
    this.activeType.set(idType);
    this.applyAllFilters();
  }

  /** Filtre par département (filtre aussi les filières du formulaire/select) */
  findDocumentationByDepartement(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    this.filterFiliereForDepartement(idD);
    this.applyAllFilters();
  }

  filterFiliereForDepartement(idD: number): void {
    if (!idD) {
      this.listFiliereFiltered.set(this.listFiliere());
      return;
    }
    this.listFiliereFiltered.set(
      this.listFiliere().filter(f => f.departement?.id === idD)
    );
  }

  findDocumentByFiliere(event: Event): void {
    this.applyAllFilters();
  }

  findDocumentByNiveau(event: Event): void {
    this.applyAllFilters();
  }

  findDocumentByAnnee(event: Event): void {
    this.applyAllFilters();
  }

  findDocumentByEnseignant(event: Event): void {
    this.applyAllFilters();
  }

  onSearchInput(event: Event): void {
    this.applyAllFilters();
  }

  /**
   * Applique tous les filtres actifs à partir de listDocumentSave.
   * Récupère les valeurs directement depuis le DOM via getElementById
   * pour rester indépendant des FormControl de filtrage.
   */
  private applyAllFilters(): void {
    const searchVal = (document.getElementById('bkdoc-search-input') as HTMLInputElement)?.value?.toLowerCase() ?? '';
    const idDep     = Number((document.getElementById('bkdoc-dep-select') as HTMLSelectElement)?.value ?? 0);
    const idFil     = Number((document.getElementById('bkdoc-fil-select') as HTMLSelectElement)?.value ?? 0);
    const idNiv     = Number((document.getElementById('bkdoc-niv-select') as HTMLSelectElement)?.value ?? 0);
    const idAnnee   = Number((document.getElementById('bkdoc-annee-select') as HTMLSelectElement)?.value ?? 0);
    const idEns     = Number((document.getElementById('bkdoc-ens-select') as HTMLSelectElement)?.value ?? 0);
    const idType    = this.activeType();

    let result = this.listDocumentSave();

    if (idType !== null) {
      result = result.filter(d => d.typeDocument?.id === idType);
    }
    if (idDep)   result = result.filter(d => d.departement?.id === idDep);
    if (idFil)   result = result.filter(d => d.filiere?.id === idFil);
    if (idNiv)   result = result.filter(d => d.niveau?.id === idNiv);
    if (idAnnee) result = result.filter(d => d.anneeAcademique?.id === idAnnee);
    if (idEns)   result = result.filter(d => d.enseignant?.id === idEns);
    if (searchVal) {
      result = result.filter(d =>
        d.matiere?.intitule?.toLowerCase().includes(searchVal) ||
        d.enseignant?.nom?.toLowerCase().includes(searchVal) ||
        d.enseignant?.prenom?.toLowerCase().includes(searchVal) ||
        d.typeDocument?.intitule?.toLowerCase().includes(searchVal)
      );
    }

    this.listDocument.set(result);
  }

  resetFilters(): void {
    this.activeType.set(null);
    // Reset selects du DOM
    ['bkdoc-dep-select','bkdoc-fil-select','bkdoc-niv-select',
     'bkdoc-annee-select','bkdoc-ens-select'].forEach(id => {
      const el = document.getElementById(id) as HTMLSelectElement;
      if (el) el.value = '';
    });
    const search = document.getElementById('bkdoc-search-input') as HTMLInputElement;
    if (search) search.value = '';

    this.listFiliereFiltered.set(this.listFiliere());
    this.listDocument.set(this.listDocumentSave());
  }

  // 
  // SÉLECTION DÉTAIL
  // 
  selectDocument(d: Documentation): void {
    this.selectedDocument.set(d);
  }

  closeDetail(): void {
    this.selectedDocument.set(null);
  }

  // 
  // MODAL
  // 
  openModal(): void {
    this.documentForm.reset();
    this.submitSuccess.set(false);
    this.submitError.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  /** Filtre les filières dans le formulaire quand le département change */
  onDepartementChangeForm(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    this.filterFiliereForDepartement(idD);
    this.documentForm.get('filiere')?.setValue('');
  }

  // 
  // SOUMISSION
  // 
  creationDocument(): void {
   

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(false);

    const formData : FormData = new FormData(); 
    formData.append("document", JSON.stringify(this.documentForm.value)); 
    formData.append("file", this.fileToUpload); 

    console.log(this.documentForm.value); 

    this.scolariteService.createDocument(formData).subscribe({
      next: (response: ResponseServer) => {
        
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        console.log(response.message); 
        
        this.getAllDocument(); 

        this.documentForm.reset(); 
        // Ferme le modal après 1.5 s
        setTimeout(() => {
          this.closeModal();
          this.submitSuccess.set(false);
        }, 1500);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  fileToUpload !:File ; 
  selectFile(file: any): void { 
      if (file.target.files) {
        
        let reader = new FileReader();
        reader.readAsDataURL(file.target.files[0]);
        reader.onload=(event :any)=>{

          //this.fetchPhotoUrl.set(event.target.result) ; 
          this.fileToUpload = file.target.files[0];

          console.log('Nom de la photo :'+this.fileToUpload.name); 
        }
    }
  }


  /** Compte les documents d'un type donné pour les badges numériques */
  countByType(idType: number): number {
    return this.listDocumentSave().filter(d => d.typeDocument?.id === idType).length;
  }
}