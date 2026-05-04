import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HoraireService } from '../../../Core/Service/Horaire/horaire-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Matiere } from '../../../Core/Model/Scolarite/Matiere';
import { Salle } from '../../../Core/Model/Structure/Salle';
import { Jour } from '../../../Core/Model/Horaire/Jour';
import { Periode } from '../../../Core/Model/Horaire/Periode';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { Horaire } from '../../../Core/Model/Horaire/Horaire';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { Repartition } from '../../../Core/Model/Scolarite/Repartition';

@Component({
  selector: 'app-time',
  imports: [ReactiveFormsModule],
  templateUrl: './time.html',
  styleUrl: './time.css',
})
export class Time {

  timeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private scolariteService: ScolariteService,
    private utilisateurService: UtilisateurService,
    private horaireService: HoraireService
  ) {
    this.timeForm = this.fb.group({
      id:          new FormControl(),
      enseignant:  new FormControl(),
      filiere:     new FormControl(),
      niveau:      new FormControl(),
      matiere:     new FormControl(),
      salle:       new FormControl(),
      jour:        new FormControl(),
      periode:     new FormControl(),
      repartition: new FormControl(),   // ← ajouté pour lier au select répartition dans le modal
    });

    this.loadPage();
  }

  loadPage(): void {
    this.getAllFiliere();
    this.getAllEnseignant();
    this.getAllNiveau();
    this.getAllMatiere();
    this.getAllJour();
    this.getAllPeriode();
    this.getAllSalle();
  }

  // ─── Listes de référence ──────────

  listFiliere = signal<Filiere[]>([]);
  getAllFiliere(): void {
    this.configService.getAllFiliere().subscribe({
      next:  (data: Filiere[]) => this.listFiliere.set(data),
      error: () => console.log('Fetch list filiere : failed'),
    });
  }

  listNiveau = signal<Niveau[]>([]);
  getAllNiveau(): void {
    this.configService.getAllNiveau().subscribe({
      next:  (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.log('Fetch list Niveau : failed'),
    });
  }

  listMatiere = signal<Matiere[]>([]);
  getAllMatiere(): void {
    this.scolariteService.getAllMatiere().subscribe({
      next:  (data: Matiere[]) => this.listMatiere.set(data),
      error: () => console.log('Fetch list Matiere : failed'),
    });
  }

  listSalle = signal<Salle[]>([]);
  getAllSalle(): void {
    this.configService.getAllSalle().subscribe({
      next:  (data: Salle[]) => this.listSalle.set(data),
      error: () => console.log('Fetch list Salle : failed'),
    });
  }

  listJour = signal<Jour[]>([]);
  getAllJour(): void {
    this.configService.getAllJour().subscribe({
      next:  (data: Jour[]) => this.listJour.set(data),
      error: () => console.log('Fetch list Jour : failed'),
    });
  }

  listPeriode = signal<Periode[]>([]);
  getAllPeriode(): void {
    this.configService.getAllPeriode().subscribe({
      next:  (data: Periode[]) => this.listPeriode.set(data),
      error: () => console.log('Fetch list Periode : failed'),
    });
  }

  listEnseignant = signal<Enseignant[]>([]);
  getAllEnseignant(): void {
    this.utilisateurService.getAllEnseignant().subscribe({
      next:  (data: Enseignant[]) => this.listEnseignant.set(data),
      error: () => console.log('Fetch list Enseignant : failed'),
    });
  }

  // ─── Filtres ─

  idFiliere = signal<number>(0);
  idNiveau  = signal<number>(0);

  /** Filtre : sélection filière → mémorise l'id et l'objet */
  getIdFiliere(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idFiliere.set(id);
    this.fecthFiliereById(id);
  }

  /** Filtre : sélection niveau → mémorise l'id et l'objet */

  getIdNiveau(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idNiveau.set(id);
    this.fecthNiveauById(id);
  }

  /**
   * Bouton "Appliquer les filtres" :
   *  - Si filière + niveau → charge les horaires et les répartitions
   *  - Si enseignant seul  → charge les horaires de l'enseignant
   */
  applyFilters(): void {
    const idF = this.idFiliere();
    const idN = this.idNiveau();
    const idE = this.idEnseignantFilter();

    if (idF !== 0 && idN !== 0) {
      this.findHoraireByFiliereAndNiveau(idF, idN);
      this.getAllRepartitionByFiliereAndNiveau(idF, idN);
      this.tableVisible.set(true);
    } else if (idE !== 0) {
      this.findHoraireByEnseignant(idE);
      this.tableVisible.set(true);
    }
  }

  /** Bouton "Réinitialiser les filtres" */
  resetFilters(): void {
    this.idFiliere.set(0);
    this.idNiveau.set(0);
    this.idEnseignantFilter.set(0);
    this.filiereSelected.set(undefined);
    this.niveauSelected.set(undefined);
    this.enseignantSelected.set(undefined);
    this.listHoraire.set([]);
    this.listRepartition.set([]);
    this.tableVisible.set(false);
  }

  /** Indique si le tableau doit être affiché (après appui sur "Appliquer") */
  tableVisible = signal<boolean>(false);

  // ─── Filtre enseignant ────────────

  idEnseignantFilter = signal<number>(0);
  enseignantSelected = signal<Enseignant | undefined>(undefined);

  getIdEnseignant(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idEnseignantFilter.set(id);
    this.enseignantSelected.set(
      this.listEnseignant().find(e => e.id === id)
    );
  }

  findHoraireByEnseignant(id: number): void {
    this.horaireService.getAllHoraireByEnseignant(id).subscribe({
      next:  (data: Horaire[]) => this.listHoraire.set(data),
      error: () => console.log('Fetch list horaire by enseignant : failed'),
    });
  }

  // ─── Sélection filière / niveau ───

  filiereSelected = signal<Filiere | undefined>(undefined);
  fecthFiliereById(id: number): void {
    this.filiereSelected.set(this.listFiliere().find(f => f.id == id));
  }

  niveauSelected = signal<Niveau | undefined>(undefined);
  fecthNiveauById(id: number): void {
    this.niveauSelected.set(this.listNiveau().find(n => n.id == id));
  }

  // ─── Horaires 

  listHoraire = signal<Horaire[]>([]);

  findHoraireByFiliereAndNiveau(idF: number, idN: number): void {
    //console.log('find horaire by filiere and niveau')

    this.horaireService.getAllHoraireByFiliereAndNiveau(idF, idN).subscribe({
      next:  (data: Horaire[]) => {
        
        this.listHoraire.set(data); 
      },
      error: () => console.log('Fetch list horaire : failed'),
    });
  }

  horaireForRepartitionExist = signal<boolean>(false); 
  horaireProgrammeByR = signal<Horaire | null>(null); 

  findHoraireByRepartition(idR: number) {
  console.log('find horaire by repartition');
  this.horaireService.getHoraireByRepartition(idR).subscribe({
    next: (data: Horaire) => {

      //console.log( data);
      if (data != null) {
        this.horaireForRepartitionExist.set(true);
        console.log('état de horaire par repartition', this.horaireForRepartitionExist());
        this.horaireProgrammeByR.set(data);
        console.log(this.horaireProgrammeByR());
        console.log('ce cours a deja été programmé', data);

      } else {
        this.horaireForRepartitionExist.set(false);
        this.horaireProgrammeByR.set(null);
        console.log('ce cours n\'a pas encore été programmé', data);
      }
    },
    error: () => console.log('Fetch horaire by repartition : failed'),
  });
}

  horaireForSalleJourAndPeriodeExist = signal<boolean>(false); 
  horaireProgrammeByS = signal<Horaire | null>(null); 


  findHoraireBySalleJourAndPeriod(idS:number, idJour:number , idP:number){
    console.log('find horaire by salle jour and periode ')
    this.horaireService.getHoraireBySalleJourAndPeriode(idS, idJour, idP).subscribe({
      next:  (data: Horaire) => {
        if (data != null) {
          this.horaireForSalleJourAndPeriodeExist.set(true);
          this.horaireProgrammeByS.set(data); 

          console.log('etat de horaire par salle , jour et peridoe ', this.horaireForSalleJourAndPeriodeExist());

        } else{
          this.horaireForSalleJourAndPeriodeExist.set(false);
          console.log('la salle est disponible'); 
        }
      },
      error: () => console.log('Fetch list horaire : failed'),
    });
  }

  // --- Recuperationd des ids :repartition,  jour , periode et salle 
  idJourSelected = 0; 
  getIdJour(event :Event){
    this.idJourSelected = Number((event.target as HTMLSelectElement).value) ; 
  }

  idRepartitionSelected = 0; 
  getIdRepartitionr(event :Event){
    this.idRepartitionSelected = Number((event.target as HTMLSelectElement).value) ;
    this.findHoraireByRepartition(this.idRepartitionSelected); 
  }

  idSalleSelected = 0; 
  getIdSalle(event :Event){
    this.idSalleSelected = Number((event.target as HTMLSelectElement).value) ; 
    this.findHoraireBySalleJourAndPeriod(this.idSalleSelected, this.idJourSelected, this.idPeriodeSelected); 
  }

  idPeriodeSelected = 0; 
  getIdPeriode(event :Event){
    this.idPeriodeSelected = Number((event.target as HTMLSelectElement).value) ; 
  }


  // ─── Répartitions (pour le select du modal de création) ─

  listRepartition = signal<Repartition[]>([]);

  getAllRepartitionByFiliereAndNiveau(idF: number, idN: number): void {
    this.scolariteService.getAllRepartitionByFiliereAndNiveau(idF, idN).subscribe({
      next:  (data: Repartition[]) => {
        
        this.listRepartition.set(data); 
      },
      error: (err) => console.error('Erreur list repartition by filiere/niveau', err),
    });
  }

  getAllRepartitionByFiliereAndNiveauAndSemestre(idF: number, idN: number, idS: number): void {
    this.scolariteService.getAllRepartitionByFiliereAndNiveauAndSemestre(idF, idN, idS).subscribe({
      next:  (data: Repartition[]) => this.listRepartition.set(data),
      error: (err) => console.error('Erreur list repartition filiere/niveau/semestre', err),
    });
  }

  // ─── Formulaire (modal filtres du form creation interne) 

  idFiliereForm = 0;
  filiereSelectedInFilter  = signal<Filiere | null >(null); 
  getFiliere(event: Event): void {
    this.idFiliereForm = Number((event.target as HTMLSelectElement).value);
    this.getAllMatiereByFiliere();

    this.filiereSelectedInFilter.set(this.listFiliere().find(f=> f.id==this.idFiliereForm)!); 

  }

  idNiveauForm = 0;

  getNiveau(event: Event): void {
    this.idNiveauForm = Number((event.target as HTMLSelectElement).value);

   
  }

  getAllMatiereByFiliere(): void {
    this.scolariteService.getAllMatiereByFiliere(this.idFiliereForm).subscribe({
      next:  (data: Matiere[]) => this.listMatiere.set(data),
      error: () => console.log('List matiere by filiere : failed'),
    });
  }

  // ─── CRUD Horaire ─────────────────

  createHoraire(): void {
    const raw = this.timeForm.value;

    const payload = {
      id:          raw.id          ? Number(raw.id)          : null,
      repartition: raw.repartition ? Number(raw.repartition) : null,
      salle:       raw.salle       ? Number(raw.salle)       : null,
      jour:        raw.jour        ? Number(raw.jour)        : null,
      periode:     raw.periode     ? Number(raw.periode)     : null,
    };

     console.log('payload horaire :', payload);

      const formData = new FormData();
      formData.append('horaire', JSON.stringify(payload));

      this.horaireService.createHoraire(formData).subscribe({
        next: (data: ResponseServer) => {
          if (data.status) {
            console.log(data.message);
            this.findHoraireByFiliereAndNiveau(this.idFiliere(), this.idNiveau());
            this.timeForm.reset();
          }
        },
        error: () => console.log('Création horaire : failed'),
      });
  }

  deleteHoraire(id: number): void {
    if (!confirm('Confirmer la suppression de cet horaire ?')) return;
    // this.horaireService.deleteHoraire(id).subscribe(...)
  }

  resetForm(): void {
    this.timeForm.reset(); 
    this.horaireForRepartitionExist.set(false);
    this.horaireForSalleJourAndPeriodeExist.set(false); 
  }

  // ─── Modal visualisation emploi du temps ────────────────

  /**
   * Construit une grille emploi du temps :
   * lignes = périodes, colonnes = jours.
   * Retourne un Map<periodeId, Map<jourId, Horaire>>.
   */
  getEmploiDuTempsGrid(): { periode: Periode; cells: { jour: Jour; horaire: Horaire | null }[] }[] {
    const jours    = this.listJour();
    const periodes = this.listPeriode();
    const horaires = this.listHoraire();

    return periodes.map(periode => ({
      periode,
      cells: jours.map(jour => ({
        jour,
        horaire: horaires.find(
          h => h.periode.id === periode.id && h.jour.id === jour.id
        ) ?? null,
      })),
    }));
  }

  // ─── Modes d'affichage modal ───────

  isImpression = signal<boolean>(false);

  toggleToEdit(): void {
    this.isImpression.set(false);
    this.timeForm.reset();
  }

  toggleToImpression(): void {
    this.isImpression.set(true);
  }

  resetTimeFb(){
    this.timeForm.reset(); 
    this.horaireForRepartitionExist.set(false);
    this.horaireForSalleJourAndPeriodeExist.set(false); 
  }



  chargement = signal(false);
  erreur     = signal<string | null>(null);

  telecharger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.horaireService.telechargementByFiliereAndNiveau(this.idFiliere(), this.idNiveau()).subscribe({
      next: (blob: Blob) => {
        this.declencherTelechargement(blob);
        this.chargement.set(false);
      },
      error: (err) => {
        console.error('Erreur téléchargement PDF :', err);
        this.erreur.set('Impossible de générer la fiche de notes. Veuillez réessayer.');
        this.chargement.set(false);
      }
    });
  }


   private declencherTelechargement(blob: Blob): void {
    const url    = URL.createObjectURL(blob);
    const lien   = document.createElement('a');
    lien.href    = url;
    lien.download = "EMP_"+this.filiereSelected()?.abreviation+"_"+this.niveauSelected()?.intitule+".pdf";
    lien.click();
    URL.revokeObjectURL(url); // libère la mémoire
  }
}