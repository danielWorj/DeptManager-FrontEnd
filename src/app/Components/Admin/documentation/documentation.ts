import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

// ── Types ──────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  icon: string;
  visible: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-documentation',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class DocumentationC implements OnInit {

  // ── Formulaire ───────────────────────────────────────────────────────────────
  documentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private scolariteService: ScolariteService,
    private utilisateurService: UtilisateurService,
    private configService: ConfigService,
    private sanitizer: DomSanitizer,
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

  // ── Listes de données ────────────────────────────────────────────────────────
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

  // ── Détail sélectionné ───────────────────────────────────────────────────────
  selectedDocument = signal<Documentation | null>(null);

  // ── État UI ──────────────────────────────────────────────────────────────────
  showModal     = signal<boolean>(false);
  isSubmitting  = signal<boolean>(false);
  submitSuccess = signal<boolean>(false);
  submitError   = signal<boolean>(false);
  activeType    = signal<number | null>(null);

  // ── Spinners de chargement ───────────────────────────────────────────────────
  isLoadingList    = signal<boolean>(false);
  isLoadingFilters = signal<boolean>(false);

  private filterLoadCount = 0;

  private startListLoading():   void { this.isLoadingList.set(true); }
  private stopListLoading():    void { this.isLoadingList.set(false); }

  private startFilterLoading(): void {
    this.filterLoadCount++;
    this.isLoadingFilters.set(true);
  }
  private stopFilterLoading(): void {
    this.filterLoadCount = Math.max(0, this.filterLoadCount - 1);
    if (this.filterLoadCount === 0) this.isLoadingFilters.set(false);
  }

  // ── Toasts ───────────────────────────────────────────────────────────────────
  toasts = signal<Toast[]>([]);
  private toastCounter = 0;

  private readonly TOAST_ICONS: Record<ToastType, string> = {
    success: 'bi-check-circle-fill',
    error:   'bi-x-circle-fill',
    info:    'bi-info-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
  };

  showToast(type: ToastType, message: string, duration = 4000): void {
    const id = ++this.toastCounter;
    this.toasts.update(t => [...t, { id, type, message, icon: this.TOAST_ICONS[type], visible: false }]);
    // Délai pour déclencher l'animation d'entrée CSS
    setTimeout(() => {
      this.toasts.update(ts => ts.map(t => t.id === id ? { ...t, visible: true } : t));
    }, 20);
    setTimeout(() => this.removeToast(id), duration);
  }

  removeToast(id: number): void {
    this.toasts.update(ts => ts.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => this.toasts.update(ts => ts.filter(t => t.id !== id)), 350);
  }

  // ── Prévisualisation plein écran ─────────────────────────────────────────────
  showPreviewModal = signal<boolean>(false);
  previewDoc       = signal<Documentation | null>(null);

  openPreviewModal(doc: Documentation): void {
    this.previewDoc.set(doc);
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    setTimeout(() => this.previewDoc.set(null), 300);
  }

  /**
   * Extrait l'extension d'une URL en ignorant les query params et fragments.
   * Exemple : "https://res.cloudinary.com/.../exam.pdf?v=3" → "pdf"
   */
  getExtension(url: string): string {
    if (!url) return '';
    const clean = url.split('?')[0].split('#')[0];
    return (clean.split('.').pop() ?? '').toLowerCase().trim();
  }

  /** true si l'URL pointe vers un PDF */
  isPdf(url: string): boolean {
    return this.getExtension(url) === 'pdf';
  }

  /** true si l'URL pointe vers une image courante */
  isImage(url: string): boolean {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(
      this.getExtension(url)
    );
  }

  /**
   * Corrige les URLs Cloudinary pour les PDFs :
   * Cloudinary stocke les PDF en "raw", mais l'upload peut enregistrer
   * une URL en "/image/upload/". On la corrige en "/raw/upload/".
   *
   * Exemple :
   *   https://res.cloudinary.com/xxx/image/upload/v123/mon-app/doc.pdf
   *   → https://res.cloudinary.com/xxx/raw/upload/v123/mon-app/doc.pdf
   */
  private fixCloudinaryPdfUrl(url: string): string {
    if (!url) return url;
    if (this.isPdf(url) && url.includes('cloudinary.com')) {
      return url.replace('/image/upload/', '/raw/upload/');
    }
    return url;
  }

  /**
   * Retourne l'URL de visualisation pour un PDF dans une iframe.
   * Utilise Google Docs Viewer comme proxy pour éviter les blocages
   * CORS / X-Frame-Options des serveurs tiers (dont Cloudinary).
   *
   * L'URL Cloudinary est d'abord corrigée (/image/ → /raw/) si besoin.
   */
  getPdfViewerUrl(url: string): SafeResourceUrl {
    const fixed   = this.fixCloudinaryPdfUrl(url);
    const encoded = encodeURIComponent(fixed);
    const viewer  = `https://docs.google.com/viewer?url=${encoded}&embedded=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewer);
  }

  /**
   * Retourne l'URL directe corrigée (pour les liens Ouvrir / Télécharger).
   */
  getDirectUrl(url: string): string {
    return this.fixCloudinaryPdfUrl(url);
  }

  /**
   * Sanitise une URL arbitraire pour les iframes (images SVG, etc.)
   */
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCHES
  // ─────────────────────────────────────────────────────────────────────────────
  getAllDocument(): void {
    this.startListLoading();
    this.scolariteService.getAllDocument().subscribe({
      next: (data: Documentation[]) => {
        this.listDocument.set(data);
        this.listDocumentSave.set(data);
        this.stopListLoading();
        this.showToast('info', `${data.length} document(s) chargé(s).`);
      },
      error: () => {
        this.stopListLoading();
        this.showToast('error', 'Impossible de charger la liste des documents.');
      },
    });
  }

  getAllDepartement(): void {
    this.startFilterLoading();
    this.configService.getAllDepartement().subscribe({
      next: (data: Departement[]) => { this.listDepartement.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch departement failed'); },
    });
  }

  getAllFiliere(): void {
    this.startFilterLoading();
    this.configService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => {
        this.listFiliere.set(data);
        this.listFiliereFiltered.set(data);
        this.stopFilterLoading();
      },
      error: () => { this.stopFilterLoading(); console.error('Fetch filiere failed'); },
    });
  }

  getAllNiveau(): void {
    this.startFilterLoading();
    this.configService.getAllNiveau().subscribe({
      next: (data: Niveau[]) => { this.listNiveau.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch niveau failed'); },
    });
  }

  getAllMatiere(): void {
    this.startFilterLoading();
    this.scolariteService.getAllMatiere().subscribe({
      next: (data: Matiere[]) => { this.listMatiere.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch matiere failed'); },
    });
  }

  getAllEnseignant(): void {
    this.startFilterLoading();
    this.utilisateurService.getAllEnseignant().subscribe({
      next: (data: Enseignant[]) => { this.listEnseignant.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch enseignant failed'); },
    });
  }

  getAllAnneeAcademique(): void {
    this.startFilterLoading();
    this.configService.getAllAnneeAcademique().subscribe({
      next: (data: AnneeAcademique[]) => { this.listAnneeAcademique.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch anneeAcademique failed'); },
    });
  }

  getAllTypeDocument(): void {
    this.startFilterLoading();
    this.configService.getAllTypeDocument().subscribe({
      next: (data: TypeDocument[]) => { this.listTypeDocument.set(data); this.stopFilterLoading(); },
      error: () => { this.stopFilterLoading(); console.error('Fetch typeDocument failed'); },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTRES
  // ─────────────────────────────────────────────────────────────────────────────
  filterByType(idType: number | null): void {
    this.activeType.set(idType);
    this.applyAllFilters();
  }

  findDocumentationByDepartement(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    this.filterFiliereForDepartement(idD);
    this.applyAllFilters();
  }

  filterFiliereForDepartement(idD: number): void {
    if (!idD) { this.listFiliereFiltered.set(this.listFiliere()); return; }
    this.listFiliereFiltered.set(this.listFiliere().filter(f => f.departement?.id === idD));
  }

  findDocumentByFiliere(event: Event):    void { this.applyAllFilters(); }
  findDocumentByNiveau(event: Event):     void { this.applyAllFilters(); }
  findDocumentByAnnee(event: Event):      void { this.applyAllFilters(); }
  findDocumentByEnseignant(event: Event): void { this.applyAllFilters(); }
  onSearchInput(event: Event):            void { this.applyAllFilters(); }

  private applyAllFilters(): void {
    const searchVal = (document.getElementById('bkdoc-search-input') as HTMLInputElement)?.value?.toLowerCase() ?? '';
    const idDep     = Number((document.getElementById('bkdoc-dep-select')   as HTMLSelectElement)?.value ?? 0);
    const idFil     = Number((document.getElementById('bkdoc-fil-select')   as HTMLSelectElement)?.value ?? 0);
    const idNiv     = Number((document.getElementById('bkdoc-niv-select')   as HTMLSelectElement)?.value ?? 0);
    const idAnnee   = Number((document.getElementById('bkdoc-annee-select') as HTMLSelectElement)?.value ?? 0);
    const idEns     = Number((document.getElementById('bkdoc-ens-select')   as HTMLSelectElement)?.value ?? 0);
    const idType    = this.activeType();

    let result = this.listDocumentSave();
    if (idType !== null) result = result.filter(d => d.typeDocument?.id === idType);
    if (idDep)           result = result.filter(d => d.departement?.id === idDep);
    if (idFil)           result = result.filter(d => d.filiere?.id === idFil);
    if (idNiv)           result = result.filter(d => d.niveau?.id === idNiv);
    if (idAnnee)         result = result.filter(d => d.anneeAcademique?.id === idAnnee);
    if (idEns)           result = result.filter(d => d.enseignant?.id === idEns);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // SÉLECTION DÉTAIL
  // ─────────────────────────────────────────────────────────────────────────────
  selectDocument(d: Documentation): void { this.selectedDocument.set(d); }
  closeDetail(): void                     { this.selectedDocument.set(null); }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODAL CRÉATION
  // ─────────────────────────────────────────────────────────────────────────────
  openModal(): void {
    this.documentForm.reset();
    this.submitSuccess.set(false);
    this.submitError.set(false);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  onDepartementChangeForm(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    this.filterFiliereForDepartement(idD);
    this.documentForm.get('filiere')?.setValue('');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────────────────────────────────────────
  fileToUpload!: File;

  selectFile(file: any): void {
    if (file.target.files) {
      const reader = new FileReader();
      reader.readAsDataURL(file.target.files[0]);
      reader.onload = () => {
        this.fileToUpload = file.target.files[0];
      };
    }
  }

  creationDocument(): void {
    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(false);

    const formData = new FormData();
    formData.append('document', JSON.stringify(this.documentForm.value));
    formData.append('file', this.fileToUpload);

    this.scolariteService.createDocument(formData).subscribe({
      next: (response: ResponseServer) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.showToast('success', 'Document ajouté avec succès !');
        this.getAllDocument();
        this.documentForm.reset();
        setTimeout(() => { this.closeModal(); this.submitSuccess.set(false); }, 1500);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submitError.set(true);
        this.showToast('error', "Échec de l'ajout du document. Veuillez réessayer.");
      },
    });
  }

  countByType(idType: number): number {
    return this.listDocumentSave().filter(d => d.typeDocument?.id === idType).length;
  }
}