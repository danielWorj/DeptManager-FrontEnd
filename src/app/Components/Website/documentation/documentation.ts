import {
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe }           from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ScolariteService }   from '../../../Core/Service/Scolarite/scolarite-service';
import { ConfigService }      from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';

import { Departement }        from '../../../Core/Model/Structure/Departement';
import { Niveau }             from '../../../Core/Model/Structure/Niveau';
import { Filiere }            from '../../../Core/Model/Structure/Filiere';
import { Matiere }            from '../../../Core/Model/Scolarite/Matiere';
import { Enseignant }         from '../../../Core/Model/Utilisateur/Enseignant';
import { AnneeAcademique }    from '../../../Core/Model/Scolarite/anneeacademique';
import { TypeDocument }       from '../../../Core/Model/Scolarite/TypeDocument';
import { Documentation }      from '../../../Core/Model/Scolarite/Document';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [DatePipe],           // ← DatePipe requis pour | date dans le template
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class DocumentationC implements OnInit {

  private readonly configService      = inject(ConfigService);
  private readonly scolariteService   = inject(ScolariteService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly sanitizer          = inject(DomSanitizer);  // ← pour getSafeUrl()

  // ── Listes de données ────────────────────────────────────────────────────
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

  // ── État de sélection / filtre ───────────────────────────────────────────
  selectedDocument = signal<Documentation | null>(null);
  activeType       = signal<number | null>(null);   // null = "Tous"

  // ── Lifecycle ────────────────────────────────────────────────────────────
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

  // ── Chargement des données ───────────────────────────────────────────────
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
      next: (data: Matiere[]) => this.listMatiere.set(data),
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

  // ── Filtres ──────────────────────────────────────────────────────────────

  /** Filtre par type via les badges (null = tous) */
  filterByType(idType: number | null): void {
    this.activeType.set(idType);
    this.applyAllFilters();
  }

  /** Filtre par département + met à jour la liste des filières */
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

  findDocumentByFiliere(event: Event): void   { this.applyAllFilters(); }
  findDocumentByNiveau(event: Event): void    { this.applyAllFilters(); }
  findDocumentByAnnee(event: Event): void     { this.applyAllFilters(); }
  findDocumentByEnseignant(event: Event): void { this.applyAllFilters(); }
  onSearchInput(event: Event): void           { this.applyAllFilters(); }

  /**
   * Applique tous les filtres actifs à partir de listDocumentSave.
   * Lit les valeurs directement depuis le DOM (IDs stables préfixés bkdoc-).
   */
  private applyAllFilters(): void {
    const searchVal = (document.getElementById('bkdoc-search-input') as HTMLInputElement)
      ?.value?.toLowerCase() ?? '';
    const idDep   = Number((document.getElementById('bkdoc-dep-select')   as HTMLSelectElement)?.value ?? 0);
    const idFil   = Number((document.getElementById('bkdoc-fil-select')   as HTMLSelectElement)?.value ?? 0);
    const idNiv   = Number((document.getElementById('bkdoc-niv-select')   as HTMLSelectElement)?.value ?? 0);
    const idAnnee = Number((document.getElementById('bkdoc-annee-select') as HTMLSelectElement)?.value ?? 0);
    const idEns   = Number((document.getElementById('bkdoc-ens-select')   as HTMLSelectElement)?.value ?? 0);
    const idType  = this.activeType();

    let result = this.listDocumentSave();

    if (idType  !== null) result = result.filter(d => d.typeDocument?.id    === idType);
    if (idDep)            result = result.filter(d => d.departement?.id     === idDep);
    if (idFil)            result = result.filter(d => d.filiere?.id         === idFil);
    if (idNiv)            result = result.filter(d => d.niveau?.id          === idNiv);
    if (idAnnee)          result = result.filter(d => d.anneeAcademique?.id === idAnnee);
    if (idEns)            result = result.filter(d => d.enseignant?.id      === idEns);

    if (searchVal) {
      result = result.filter(d =>
        d.matiere?.intitule?.toLowerCase().includes(searchVal)      ||
        d.enseignant?.nom?.toLowerCase().includes(searchVal)        ||
        d.enseignant?.prenom?.toLowerCase().includes(searchVal)     ||
        d.typeDocument?.intitule?.toLowerCase().includes(searchVal)
      );
    }

    this.listDocument.set(result);
  }

  resetFilters(): void {
    this.activeType.set(null);
    ['bkdoc-dep-select', 'bkdoc-fil-select', 'bkdoc-niv-select',
     'bkdoc-annee-select', 'bkdoc-ens-select'].forEach(id => {
      const el = document.getElementById(id) as HTMLSelectElement;
      if (el) el.value = '';
    });
    const search = document.getElementById('bkdoc-search-input') as HTMLInputElement;
    if (search) search.value = '';

    this.listFiliereFiltered.set(this.listFiliere());
    this.listDocument.set(this.listDocumentSave());
  }

  // ── Sélection détail ─────────────────────────────────────────────────────
  selectDocument(d: Documentation): void { this.selectedDocument.set(d); }
  closeDetail(): void                     { this.selectedDocument.set(null); }

  // ── Helpers template ─────────────────────────────────────────────────────

  /**
   * Remplace le pipe `typeLabel` inexistant.
   * Retourne l'intitulé du type actif, ou chaîne vide si non trouvé.
   */
  getActiveTypeLabel(): string {
    const id = this.activeType();
    if (id === null) return '';
    return this.listTypeDocument().find(t => t.id === id)?.intitule ?? '';
  }

  /**
   * Sanitize une URL pour l'utiliser dans [src] d'un <iframe>.
   * Nécessaire pour éviter l'erreur "unsafe value used in a resource URL context".
   */
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}