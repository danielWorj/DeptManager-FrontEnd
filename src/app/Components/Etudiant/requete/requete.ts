import { Component, computed, inject, signal } from '@angular/core';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { PieceJointeRequete } from '../../../Core/Model/Requete/PieceJointeRequete';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { MotifRequete } from '../../../Core/Model/Requete/MotifRequete';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Requete } from '../../../Core/Model/Requete/Requete';




@Component({
  selector: 'app-requete',
  imports: [ReactiveFormsModule],
  templateUrl: './requete.html',
  styleUrl: './requete.css',
})



export class RequeteE {

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
  listRequete   = signal<Requete[]>([]);   // source de vérité (non filtrée)
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
          error: (err: any) => console.error('Erreur change statut :', err),
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
