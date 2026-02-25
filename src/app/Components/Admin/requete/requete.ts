import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Requete } from '../../../Core/Model/Requete/Requete';
import { MotifRequete } from '../../../Core/Model/Requete/MotifRequete';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { PieceJointeRequete } from '../../../Core/Model/Requete/PieceJointeRequete';

/** Valeurs des filtres actifs */
interface FilterState {
  search:      string;
  etudiantId:  number | null;
  departementId: number | null;
  filiereId:   number | null;
  motifId:     number | null;
  dateDebut:   string;
  dateFin:     string;
}

@Component({
  selector: 'app-requete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './requete.html',
  styleUrl: './requete.css',
})
export class RequeteC  {

  private fb               = inject(FormBuilder);
  private scolariteService = inject(ScolariteService);
  private utilisateurService = inject(UtilisateurService);

    // ─── Cycle de vie 
  constructor() {
    this.buildForm();
    this.loadPage();
  }

  loadPage(){
    this.getAllRequete();
    this.getAllMotifRequete();
    this.getAllEtudiant();
    this.countRequeteByStatut();
  }

  loadDataRPage(){
    this.getAllRequete();
    this.countRequeteByStatut();
  }

  // ─── Données ────
  listRequeteSave   = signal<Requete[]>([]);   // source de vérité (non filtrée)
  listMotifRequete  = signal<MotifRequete[]>([]);
  listEtudiant      = signal<Etudiant[]>([]);

  // ─── Sélection / état UI ──
  requeteSelected   = signal<Requete | null>(null);
  deleteTargetId    = signal<number | null>(null);
  selectedFiles     = signal<File[]>([]);
  filterPanelOpen   = signal<boolean>(true);

  /** Toast : { message, type: 'success'|'danger'|'info' } */
  toast             = signal<{ message: string; type: string } | null>(null);

  // ─── Filtres ─────
  filterState = signal<FilterState>({
    search:        '',
    etudiantId:    null,
    departementId: null,
    filiereId:     null,
    motifId:       null,
    dateDebut:     '',
    dateFin:       '',
  });

  /** Nombre de filtres actifs (hors recherche texte) */
  activeFilterCount = computed(() => {
    const f = this.filterState();
    return [f.etudiantId, f.departementId, f.filiereId, f.motifId, f.dateDebut, f.dateFin]
      .filter(v => v !== null && v !== '').length;
  });

  /** Liste filtrée — recalculée automatiquement à chaque changement de signal */
  listRequete = computed<Requete[]>(() => {
    const f   = this.filterState();
    const src = this.listRequeteSave();

    return src.filter(r => {

      // ── Recherche texte libre
      if (f.search) {
        const needle = f.search.toLowerCase();
        const hay = [
          r.id,
          r.etudiant?.nom,
          r.etudiant?.prenom,
          r.etudiant?.filiere?.intitule,
          r.etudiant?.filiere?.departement?.intitule,
          r.motifRequete?.intitule,
          r.description,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      // ── Filtre étudiant
      if (f.etudiantId !== null && r.etudiant?.id !== f.etudiantId) return false;

      // ── Filtre département
      if (f.departementId !== null && r.etudiant?.filiere?.departement?.id !== f.departementId) return false;

      // ── Filtre filière
      if (f.filiereId !== null && r.etudiant?.filiere?.id !== f.filiereId) return false;

      // ── Filtre motif
      if (f.motifId !== null && r.motifRequete?.id !== f.motifId) return false;

      return true;
    });
  });

  /** Tags des filtres actifs pour affichage sous le panneau */
  activeFilterTags = computed<{ key: string; label: string; value: string }[]>(() => {
    const f       = this.filterState();
    const tags: { key: string; label: string; value: string }[] = [];

    if (f.search) {
      tags.push({ key: 'search', label: 'Recherche', value: f.search });
    }
    if (f.etudiantId !== null) {
      const etu = this.listEtudiant().find(e => e.id === f.etudiantId);
      tags.push({ key: 'etudiantId', label: 'Étudiant', value: etu ? `${etu.prenom} ${etu.nom}` : `#${f.etudiantId}` });
    }
    if (f.departementId !== null) {
      const dep = this.getDepartementsUniques().find(d => d.id === f.departementId);
      tags.push({ key: 'departementId', label: 'Département', value: dep?.intitule ?? `#${f.departementId}` });
    }
    if (f.filiereId !== null) {
      const fil = this.getFilieresUniques().find(f2 => f2.id === f.filiereId);
      tags.push({ key: 'filiereId', label: 'Filière', value: fil?.intitule ?? `#${f.filiereId}` });
    }
    if (f.motifId !== null) {
      const motif = this.listMotifRequete().find(m => m.id === f.motifId);
      tags.push({ key: 'motifId', label: 'Motif', value: motif?.intitule ?? `#${f.motifId}` });
    }
    if (f.dateDebut) tags.push({ key: 'dateDebut', label: 'Depuis',     value: this.formatDate(f.dateDebut) });
    if (f.dateFin)   tags.push({ key: 'dateFin',   label: "Jusqu'au",   value: this.formatDate(f.dateFin)  });

    return tags;
  });

  // ─── Listes dérivées pour les selects de filtre ──
  getDepartementsUniques(): { id: number; intitule: string }[] {
    const map = new Map<number, string>();
    this.listEtudiant().forEach(e => {
      const dep = e.filiere?.departement;
      if (dep?.id && dep?.intitule) map.set(dep.id, dep.intitule);
    });
    return Array.from(map, ([id, intitule]) => ({ id, intitule }));
  }

  getFilieresUniques(): { id: number; intitule: string }[] {
    const map = new Map<number, string>();
    this.listEtudiant().forEach(e => {
      const fil = e.filiere;
      if (fil?.id && fil?.intitule) map.set(fil.id, fil.intitule);
    });
    return Array.from(map, ([id, intitule]) => ({ id, intitule }));
  }

  // ─── Formulaire ──
  requeteFb!: FormGroup;

  private buildForm(): void {
    this.requeteFb = this.fb.group({
      id:           new FormControl<number | null>(null),
      description:  new FormControl<string>('', [Validators.required, Validators.minLength(10)]),
      motifRequete: new FormControl<number | null>(null, Validators.required),
      etudiant:     new FormControl<number | null>(null, Validators.required),
    });
  }


 
  // ─── API : Requêtes 
  getAllRequete(): void {
    this.scolariteService.getAllRequete().subscribe({
      next: (data: Requete[]) => {
        this.listRequeteSave.set(data);
      },
      error: (err) => console.error('Erreur fetch all requête :', err),
    });
  }

  createRequete(): void {
   
    const formData = new FormData();
    formData.append('requete', JSON.stringify(this.requeteFb.value));

    // Pièces jointes
    this.selectedFiles().forEach(file => {
      formData.append('pieceJointes', file, file.name);
    });

    this.scolariteService.createRequete(formData).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.showToast('Requête créée avec succès !', 'success');
          this.loadDataRPage();
          this.closeModal('createRequeteModal');
          this.resetCreateForm();
        } else {
          this.showToast(response.message ?? 'Erreur lors de la création.', 'danger');
        }
      },
      error: (err) => {
        console.error('Erreur de création :', err);
        this.showToast('Erreur serveur lors de la création.', 'danger');
      },
    });
  }

  deleteRequete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.scolariteService.deleteRequete(id).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          this.listRequeteSave.update(list => list.filter(r => r.id !== id));
          this.showToast(`Requête #${id} supprimée.`, 'danger');
          this.closeModal('deleteRequeteModal');
          this.loadDataRPage(); 
          this.deleteTargetId.set(null);
        } else {
          this.showToast(response.message ?? 'Erreur lors de la suppression.', 'danger');
        }
      },
      error: (err) => {
        console.error('Erreur suppression requête :', err);
        this.showToast('Erreur serveur lors de la suppression.', 'danger');
      },
    });
  }

  getAllMotifRequete(): void {
    this.scolariteService.getAllMotifRequete().subscribe({
      next: (response: MotifRequete[]) => this.listMotifRequete.set(response),
      error: (err) => console.error('Erreur fetch motifs :', err),
    });
  }

  getAllEtudiant(): void {
    this.utilisateurService.getAllEtudiant().subscribe({
      next: (response: Etudiant[]) => this.listEtudiant.set(response),
      error: (err) => console.error('Erreur fetch étudiants :', err),
    });
  }

  listPieceJointe = signal<PieceJointeRequete[]>([]); 
   getAllPieceJointeByRequest(id :number): void {
    this.scolariteService.getAllPieceJointeByRequete(id).subscribe({
      next: (response: PieceJointeRequete[]) => this.listPieceJointe.set(response),
      error: (err) => console.error('Erreur fetch pieces jointes :', err),
    });
  }

  changeStatutRequete(idR:number, idS:number){
    this.scolariteService.changeRequeteStatut(idR, idS).subscribe({
          next: (response: ResponseServer) => {
            console.log(response.message); 
            this.getAllRequete(); 
          },
          error: (err) => console.error('Erreur change statut :', err),
    });
  }
  // ─── Actions UI ──
  selectRequete(r: Requete): void {
    this.requeteSelected.set(r);
    this.getAllPieceJointeByRequest(r.id);
  }

  openDeleteConfirm(id: number): void {
    this.deleteTargetId.set(id);
  }

  resetCreateForm(): void {
    this.requeteFb.reset();
    this.selectedFiles.set([]);
  }
  //  Count
  listRequeteTraite = signal<Requete[]>([]);
   
  numberRequeteEnAttente = signal<number>(0); 
  numberRequeteEnTraite = signal<number>(0); 
  numberRequeteEnRejete = signal<number>(0); 

  nbrAtt =0 ; 
  nbrTrait =0 ; 
  nbrRej =0 ; 
  countRequeteByStatut(){
    this.nbrAtt =0; 
    this.nbrTrait =0 ;
    this.nbrRej =0; 
    
    for(const r of this.listRequete()){
      if (r.statutRequete.id==1) {
        //En attente 
        this.nbrAtt = this.nbrAtt+1 
      }

      if (r.statutRequete.id==2) {
        //Traite
        this.nbrTrait = this.nbrTrait+1; 
      }

      if (r.statutRequete.id==3) {
        //Traite
        this.nbrRej = this.nbrRej+1; 
      }
      
    }

    this.numberRequeteEnAttente.set(this.nbrAtt);
    this.numberRequeteEnTraite.set(this.nbrTrait);
    this.numberRequeteEnRejete.set(this.nbrRej);
  }

  //  Filtres 
  onSearchChange(value: string): void {
    this.filterState.update(f => ({ ...f, search: value }));
  }

  onEtudiantFilter(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value) || null;
    this.filterState.update(f => ({ ...f, etudiantId: id }));
  }

  onDepartementFilter(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value) || null;
    this.filterState.update(f => ({ ...f, departementId: id }));
  }

  onFiliereFilter(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value) || null;
    this.filterState.update(f => ({ ...f, filiereId: id }));
  }

  onMotifFilter(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value) || null;
    this.filterState.update(f => ({ ...f, motifId: id }));
  }

  onDateDebutFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filterState.update(f => ({ ...f, dateDebut: val }));
  }

  onDateFinFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filterState.update(f => ({ ...f, dateFin: val }));
  }

  clearOneFilter(key: string): void {
    this.filterState.update(f => ({
      ...f,
      [key]: key === 'search' || key === 'dateDebut' || key === 'dateFin' ? '' : null,
    }));
  }

  resetFilters(): void {
    this.filterState.set({
      search: '', etudiantId: null, departementId: null,
      filiereId: null, motifId: null, dateDebut: '', dateFin: '',
    });
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update(v => !v);
  }

  // ─── Pièces jointes 
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(Array.from(input.files));
    input.value = ''; // reset pour permettre la re-sélection du même fichier
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private addFiles(files: File[]): void {
    this.selectedFiles.update(existing => {
      const news = files.filter(f => !existing.some(e => e.name === f.name));
      return [...existing, ...news];
    });
  }

  removeFile(name: string): void {
    this.selectedFiles.update(files => files.filter(f => f.name !== name));
  }

  // ─── Helpers ─────
  getCountByStatut(statut: string): number {
    return this.listRequeteSave().filter(r => (r as any).statut === statut).length;
  }

  getInitials(nom?: string, prenom?: string): string {
    return [(prenom ?? '')[0], (nom ?? '')[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.requeteFb.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // ─── Toast 
  showToast(message: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  // ─── Bootstrap Modal (sans dépendance ng-bootstrap) 
  openModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getOrCreateInstance(el).show();
  }

  closeModal(id: string): void {
    const el = document.getElementById(id);
    if (el) (window as any).bootstrap?.Modal?.getInstance(el)?.hide();
  }

  openCreateModal(): void {
    this.resetCreateForm();
    this.openModal('createRequeteModal');
  }

  openViewModal(r: Requete): void {
    this.selectRequete(r);
    this.openModal('viewRequeteModal');
  }

  openDeleteModal(id: number): void {
    this.openDeleteConfirm(id);
    this.openModal('deleteRequeteModal');
  }
}