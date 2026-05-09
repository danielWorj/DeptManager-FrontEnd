import { Component, OnInit, computed, signal } from '@angular/core';
import { NgClass }                              from '@angular/common';
import { UtilisateurService }  from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ScolariteService }    from '../../../Core/Service/Scolarite/scolarite-service';
import { EvaluationService }   from '../../../Core/Service/Evaluation/evaluation-service';
import { ConfigService }       from '../../../Core/Service/Config/config-service';
import { HoraireService }      from '../../../Core/Service/Horaire/horaire-service';
import { Etudiant }            from '../../../Core/Model/Utilisateur/Etudiant';
import { Horaire }             from '../../../Core/Model/Horaire/Horaire';
import { Jour }                from '../../../Core/Model/Horaire/Jour';
import { Periode }             from '../../../Core/Model/Horaire/Periode';
import { Semestre }            from '../../../Core/Model/Scolarite/Semestre';
import { AnneeAcademique }     from '../../../Core/Model/Scolarite/anneeacademique';

@Component({
  selector: 'app-time-e',
  imports: [NgClass],
  templateUrl: './time-e.html',
  styleUrl: './time-e.css',
})
export class TimeE implements OnInit {

  // ── IDENTITÉ ÉTUDIANT ────────────────────────────────────────────────────
  idEtudiant  = signal<number>(0);
  idFiliere   = signal<number>(0);
  idNiveau    = signal<number>(0);

  constructor(
    private utilisateurService : UtilisateurService,
    private evaluationService  : EvaluationService,
    private scolariteService   : ScolariteService,
    private configService      : ConfigService,
    private horaireService     : HoraireService,
  ) {
    this.idEtudiant.set(parseInt(localStorage.getItem('id')!) ?? 0);
  }

  ngOnInit(): void {
    this.getEtudiantById(this.idEtudiant());
    this.getAllJour();
    this.getAllPeriode();
    this.getAllSemestre();
  }

  // ── ÉTUDIANT CONNECTÉ ─────────────────────────────────────────────────────
  etudiantConnected = signal<Etudiant | null>(null);

  getEtudiantById(id: number): void {
    this.utilisateurService.getEtudiantByID(id).subscribe({
      next: (data: Etudiant) => {
        this.etudiantConnected.set(data);
        this.idFiliere.set(data.filiere.id);
        this.idNiveau.set(data.niveau.id);
        // Les horaires sont chargés dès que l'on connaît la filière et le niveau
        this.getAllHoraireByEtudiant(data.filiere.id, data.niveau.id);
      },
      error: () => console.log('Fetch etudiant by id : failed'),
    });
  }

  // ── HORAIRES ──────────────────────────────────────────────────────────────
  /** Tous les horaires bruts chargés depuis l'API */
  listHoraire = signal<Horaire[]>([]);

  getAllHoraireByEtudiant(idF: number, idN: number): void {
    this.horaireService.getAllHoraireByFiliereAndNiveau(idF, idN).subscribe({
      next:  (data: Horaire[]) => this.listHoraire.set(data),
      error: () => console.log('Fetch horaire by filiere and niveau : failed'),
    });
  }

  // ── JOURS & PÉRIODES (référentiels) ──────────────────────────────────────
  listJour   = signal<Jour[]>([]);
  listPeriode = signal<Periode[]>([]);

  getAllJour(): void {
    this.configService.getAllJour().subscribe({
      next:  (data: Jour[])    => this.listJour.set(data),
      error: () => console.log('Fetch list jour : failed'),
    });
  }

  getAllPeriode(): void {
    this.configService.getAllPeriode().subscribe({
      next:  (data: Periode[]) => this.listPeriode.set(data),
      error: () => console.log('Fetch list periode : failed'),
    });
  }

  // ── SEMESTRES & ANNÉES ACADÉMIQUES ────────────────────────────────────────
  listSemestre      = signal<Semestre[]>([]);
  listSemestreSaved = signal<Semestre[]>([]);
  listAnnne         = signal<AnneeAcademique[]>([]);
  private _anneeList: AnneeAcademique[] = [];

  getAllSemestre(): void {
    this.scolariteService.getAllSemestre().subscribe({
      next: (data: Semestre[]) => {
        this.listSemestre.set(data);
        this.listSemestreSaved.set(data);
        this._buildAnneeList(data);
      },
      error: () => console.log('Fetch semestre : failed'),
    });
  }

  private _buildAnneeList(semestres: Semestre[]): void {
    this._anneeList = [];
    for (const s of semestres) {
      if (!this._anneeList.find(a => a.id === s.anneeAcademique.id)) {
        this._anneeList.push(s.anneeAcademique);
      }
    }
    this.listAnnne.set(this._anneeList);
  }

  // ── FILTRE PAR SEMESTRE ───────────────────────────────────────────────────
  idSemestreSelected = signal<number>(0);

  onSemestreChange(idSemestre: number): void {
    this.idSemestreSelected.set(idSemestre);
  }

  /** Horaires affichés : filtrés par semestre si un est sélectionné */
  listHoraireDisplay = computed<Horaire[]>(() => {
    const id = this.idSemestreSelected();
    if (id === 0) return this.listHoraire();
    return this.listHoraire().filter(
      h => h.repartition?.semestre?.id === id
    );
  });

  // ── GRILLE EMPLOI DU TEMPS ────────────────────────────────────────────────
  /**
   * Construit la grille emploi du temps :
   * lignes = périodes, colonnes = jours.
   * Utilise les jours/périodes du référentiel pour afficher les cases vides.
   */
  getEmploiDuTempsGrid(): { periode: Periode; cells: { jour: Jour; horaire: Horaire | null }[] }[] {
    const jours    = this.listJour();
    const periodes = this.listPeriode();
    const horaires = this.listHoraireDisplay();

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

  /** Détermine si une ligne contient au moins un cours (pour masquer les lignes vides) */
  rowHasHoraire(row: { cells: { horaire: Horaire | null }[] }): boolean {
    return row.cells.some(c => c.horaire !== null);
  }

  // ── COULEUR PAR MATIÈRE (déterministe via l'id) ───────────────────────────
  private readonly SLOT_COLORS = [
    'tde-slot-blue', 'tde-slot-green', 'tde-slot-purple',
    'tde-slot-orange', 'tde-slot-pink', 'tde-slot-teal',
  ];

  getSlotColor(matiereId: number): string {
    return this.SLOT_COLORS[matiereId % this.SLOT_COLORS.length];
  }

  // ── TÉLÉCHARGEMENT PDF ────────────────────────────────────────────────────
  chargement = signal(false);
  erreur     = signal<string | null>(null);

  telecharger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.horaireService
      .telechargementByFiliereAndNiveau(this.idFiliere(), this.idNiveau())
      .subscribe({
        next: (blob: Blob) => {
          this._declencherTelechargement(blob);
          this.chargement.set(false);
        },
        error: (err) => {
          console.error('Erreur téléchargement PDF :', err);
          this.erreur.set('Impossible de générer le PDF. Veuillez réessayer.');
          this.chargement.set(false);
        },
      });
  }

  private _declencherTelechargement(blob: Blob): void {
    const url  = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href  = url;
    lien.download =
      'EMP_' +
      this.etudiantConnected()?.filiere?.abreviation +
      '_' +
      this.etudiantConnected()?.niveau?.intitule +
      '.pdf';
    lien.click();
    URL.revokeObjectURL(url);
  }
}