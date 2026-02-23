//  Import Chart.js en premier, avant toute utilisation
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Component, OnDestroy, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { Departement } from '../../../Core/Model/Structure/Departement';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { DatePipe } from '@angular/common';
//  Suppression de l'import inutilisé : "sign" from 'crypto'

@Component({
  selector: 'app-etudiant-c',
  imports: [ReactiveFormsModule , DatePipe],
  templateUrl: './etudiant-c.html',
  styleUrl: './etudiant-c.css',
})
export class EtudiantC implements OnDestroy {

  etudiantForm!: FormGroup;

  //  Instances Chart stockées pour éviter les duplications et fuites mémoire
  private chartInstance:    Chart | null = null;
  private doughnutInstance: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {
    this.etudiantForm = this.fb.group({
      id:          new FormControl(),
      nom:         new FormControl(),
      prenom:      new FormControl(),
      dateCreation: new FormControl(),
      email:       new FormControl(),
      telephone:   new FormControl(),
      password:    new FormControl(),
      role:        new FormControl(),
      status:      new FormControl(),
      photo:       new FormControl(),
      matricule:   new FormControl(),
      filiere:     new FormControl(),
      niveau:      new FormControl(),
    });

    this.loadPage();
  }

  //  Destruction des charts quand le composant est détruit
  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.doughnutInstance?.destroy();
  }

  //  Signals 
  listEtudiant          = signal<Etudiant[]>([]);
  listEtudiantSave      = signal<Etudiant[]>([]);
  listDepartement       = signal<Departement[]>([]);
  //  Signal séparé pour la liste filtrée des filières (par département)
  listFiliereFiltered   = signal<Filiere[]>([]);
  listFiliere           = signal<Filiere[]>([]);
  listNiveau            = signal<Niveau[]>([]);

  labelFiliere              = signal<string[]>([]);
  numberEtudiant            = signal<number[]>([]);
  labelNiveau               = signal<string[]>([]);
  numberEtudiantParNiveau   = signal<number[]>([]);

  //  Chargement 

  loadPage(): void {
    this.getAllETudiant();
    this.getAllDepartement();
    this.getAllFiliere();
    this.getAllNiveau();
  }

  getAllETudiant(): void {
    this.utilisateurService.getAllEtudiant().subscribe({
      next: (data: Etudiant[]) => {
        this.listEtudiant.set(data);
        //  On alimente listEtudiantSave qui était vide — les filtres ne fonctionnaient pas sans ça
        this.listEtudiantSave.set(data);
      },
      error: () => console.error('Fetch list etudiant : failed'),
    });
  }

  getAllEtudiantByDepartement(id: number): void {
    this.utilisateurService.getAllEtudiantByDepartement(id).subscribe({
      next: (data: Etudiant[]) => this.listEtudiant.set(data),
      error: () => console.error('Fetch list etudiant by departement : failed'),
    });
  }

  getAllEtudiantByNiveau(id: number): void {
    this.utilisateurService.getAllEtudiantByNiveau(id).subscribe({
      next: (data: Etudiant[]) => this.listEtudiant.set(data),
      error: () => console.error('Fetch list etudiant by niveau : failed'),
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
        //  On initialise aussi la liste filtrée avec toutes les filières
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

  //  Filtres 
  findEtudiantByDepartement(event: Event): void {
    const idD = Number((event.target as HTMLSelectElement).value);
    if (!idD) {
      this.listEtudiant.set(this.listEtudiantSave());
      //  Réinitialise aussi la liste des filières filtrées
      this.listFiliereFiltered.set(this.listFiliere());
      return;
    }
    this.listEtudiant.set(
      this.listEtudiantSave().filter(e => e.filiere?.departement?.id === idD)
    );
    //  Filtre les filières selon le département sélectionné
    this.filterFiliereForDepartement(idD);
  }

  findEtudiantByFiliere(event: Event): void {
    const idF = Number((event.target as HTMLSelectElement).value);
    if (!idF) {
      this.listEtudiant.set(this.listEtudiantSave());
      return;
    }
    this.listEtudiant.set(
      this.listEtudiantSave().filter(e => e.filiere?.id === idF)
    );
  }

  findEtudiantByNiveau(event: Event): void {
    const idN = Number((event.target as HTMLSelectElement).value);
    if (!idN) {
      this.listEtudiant.set(this.listEtudiantSave());
      return;
    }
    this.listEtudiant.set(
      this.listEtudiantSave().filter(e => e.niveau?.id === idN)
    );
  }

  /**
   *  Correction majeure : l'ancienne version filtrait listFiliere() sur f.id === idD
   * ce qui comparait l'id de la filière avec l'id du département — toujours faux.
   * On filtre maintenant sur f.departement?.id === idD
   */
  filterFiliereForDepartement(idD: number): void {
    if (!idD) {
      this.listFiliereFiltered.set(this.listFiliere());
      return;
    }
    this.listFiliereFiltered.set(
      this.listFiliere().filter(f => f.departement?.id === idD)
    );
  }

  //  Formulaire 

  refreshPage(): void {
    this.getAllETudiant();
    this.getAllDepartement();
    this.getAllFiliere();
    this.getAllNiveau();
  }

  resetForm(): void {
    this.etudiantForm.reset();
  }

  createEtudiant(): void {
    if (this.etudiantForm.invalid) return;

    const formData = new FormData();
    formData.append('etudiant', JSON.stringify(this.etudiantForm.value));

    this.utilisateurService.createEtudiant(formData).subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllETudiant();
        this.etudiantForm.reset();
      },
      error: () => console.error("Erreur lors de la création d'un étudiant"),
    });
  }


  //  Détail étudiant 

  selectedEtudiant = signal<Etudiant | null>(null);

  selectEtudiant(etudiant: Etudiant): void {
    this.selectedEtudiant.set(etudiant);
  }

  closeDetail(): void {
    this.selectedEtudiant.set(null);
  }

  //  Stats 
  getStats(): void {
    this.constructData();
    this.graphEvolutionEtudiantByFiliere();

    this.constructDataNiveau();
    this.graphEtudiantParNiveau();
  }

  //  Chart Line : étudiants par filière 

  constructData(): void {
    const etudiants = this.listEtudiantSave();

    const unique = new Map<number, string>();
    etudiants.forEach(e => {
      if (e.filiere && !unique.has(e.filiere.id)) {
        unique.set(e.filiere.id, e.filiere.abreviation);
      }
    });
    this.labelFiliere.set(Array.from(unique.values()));

    //  Correction : on indexait par abreviation mais on comptait par intitule — incohérence corrigée
    const compteur = new Map<string, number>();
    etudiants.forEach(e => {
      if (e.filiere) {
        const key = e.filiere.abreviation;
        compteur.set(key, (compteur.get(key) ?? 0) + 1);
      }
    });

    this.numberEtudiant.set(
      this.labelFiliere().map(label => compteur.get(label) ?? 0)
    );
  }

  graphEvolutionEtudiantByFiliere(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    if (!canvas) { console.error('Canvas #myChart introuvable'); return; }

    this.chartInstance?.destroy();
    this.chartInstance = null;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) { console.error('Contexte 2D indisponible'); return; }

    const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(105, 108, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(105, 108, 255, 0.0)');

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.labelFiliere(),
        datasets: [{
          label: "Nombre d'étudiants par filière",
          data: this.numberEtudiant(),
          borderWidth: 3,
          borderColor: '#696cff',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#696cff',
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value) => Number.isInteger(value) ? value : null,
            },
          },
        },
      },
    });
  }

  //  Chart Doughnut : étudiants par niveau 

  //  Renommée constructDataPoste → constructDataNiveau (nom cohérent avec le contexte étudiant)
  constructDataNiveau(): void {
    const etudiants = this.listEtudiantSave();

    const unique = new Map<number, string>();
    etudiants.forEach(e => {
      if (e.niveau && !unique.has(e.niveau.id)) {
        unique.set(e.niveau.id, `${e.niveau.intitule}`);
      }
    });
    this.labelNiveau.set(Array.from(unique.values()));

    const compteur = new Map<string, number>();
    etudiants.forEach(e => {
      if (e.niveau) {
        const intitule = e.niveau.intitule;
        compteur.set(intitule, (compteur.get(intitule) ?? 0) + 1);
      }
    });

    this.numberEtudiantParNiveau.set(
      this.labelNiveau().map(label => compteur.get(label) ?? 0)
    );
  }

  //  Renommée graphEnseignantParPoste → graphEtudiantParNiveau (nom cohérent)
  graphEtudiantParNiveau(): void {
    const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement | null;
    if (!canvas) { console.error('Canvas #doughnutChart introuvable'); return; }

    this.doughnutInstance?.destroy();
    this.doughnutInstance = null;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) { console.error('Contexte 2D indisponible'); return; }

    const colors = [
      '#696cff', '#ff6b6b', '#ffd93d',
      '#6bcb77', '#4d96ff', '#ff922b',
      '#cc5de8', '#20c997', '#f06595',
    ];

    this.doughnutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.labelNiveau(),
        datasets: [{
          //  Label corrigé : "Enseignants par poste" → "Étudiants par niveau"
          label: "Étudiants par niveau",
          data: this.numberEtudiantParNiveau(),
          backgroundColor: colors.slice(0, this.labelNiveau().length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { size: 13 } },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return ` ${context.label} : ${value} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }
}