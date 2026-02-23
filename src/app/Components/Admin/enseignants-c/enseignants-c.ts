//  Les imports Chart.js doivent être AVANT leur utilisation
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Component, OnDestroy, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant';
import { Niveau } from '../../../Core/Model/Structure/Niveau';
import { Filiere } from '../../../Core/Model/Structure/Filiere';
import { Poste } from '../../../Core/Model/Utilisateur/Poste';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Departement } from '../../../Core/Model/Structure/Departement';

@Component({
  selector: 'app-enseignants-c',
  imports: [ReactiveFormsModule],
  templateUrl: './enseignants-c.html',
  styleUrl: './enseignants-c.css',
})
export class EnseignantsC implements OnDestroy {

  enseignantForm!: FormGroup;

  //  Référence au chart pour éviter les duplications lors des re-renders
  private chartInstance: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private confiService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {
    this.enseignantForm = this.fb.group({
      id: new FormControl(),
      nom: new FormControl(),
      prenom: new FormControl(),
      dateCreation: new FormControl(),
      email: new FormControl(),
      password: new FormControl(),
      telephone: new FormControl(),
      role: new FormControl(),
      status: new FormControl(),
      poste: new FormControl(),
      photo: new FormControl(),
      departement: new FormControl(),
    });

    this.loadPage(); 
  }

  loadPage(){
    this.getAllEnseignant();
    this.getAllDepartement();
    this.getAllPoste();
  }
  //  Destruction du chart pour éviter les fuites mémoire
  ngOnDestroy(): void {
     this.chartInstance?.destroy();
    this.doughnutInstance?.destroy();
  }

  

  listEnseignant       = signal<Enseignant[]>([]);
  listEnseignantSave   = signal<Enseignant[]>([]);
  listNiveau           = signal<Niveau[]>([]);
  listFiliere          = signal<Filiere[]>([]);
  listDepartemet       = signal<Departement[]>([]);
  listPoste            = signal<Poste[]>([]);
  labelDepartement     = signal<string[]>([]);
  numberEnseignant     = signal<number[]>([]);

  //Chargement des données 

  getAllEnseignant(): void {
    this.listEnseignant.set([]);
    this.utilisateurService.getAllEnseignant().subscribe({
      next: (data: Enseignant[]) => {
        this.listEnseignant.set(data);
        this.listEnseignantSave.set(data);
      },
      error: () => console.error('Fetch list enseignant : failed'),
    });
  }

  getAllNiveau(): void {
    this.confiService.getAllNiveau().subscribe({
      next: (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.error('Fetch list niveau : failed'),
    });
  }

  getAllFiliere(): void {
    this.confiService.getAllFiliere().subscribe({
      next: (data: Filiere[]) => this.listFiliere.set(data),
      error: () => console.error('Fetch list filiere : failed'),
    });
  }

  getAllDepartement(): void {
    this.confiService.getAllDepartement().subscribe({
      next: (data: Departement[]) => this.listDepartemet.set(data),
      error: () => console.error('Fetch list departement : failed'),
    });
  }

  getAllPoste(): void {
    this.confiService.getAllPoste().subscribe({
      next: (data: Poste[]) => this.listPoste.set(data),
      error: () => console.error('Fetch list poste : failed'),
    });
  }

  getAllEnseignantByDepartement(id: number): void {
    this.utilisateurService.getAllEnseignantByDepartement(id).subscribe({
      next: (data: Enseignant[]) => this.listEnseignant.set(data),
      error: () => console.error('Fetch list enseignant by departement : failed'),
    });
  }

  //  Filtres 

  findEnseignantByDepartement(event: Event): void {
    // Typage correct de l'event au lieu de "any"
    const idD = Number((event.target as HTMLSelectElement).value);
    if (!idD) {
      // Si valeur vide, on remet la liste complète
      this.listEnseignant.set(this.listEnseignantSave());
      return;
    }
    this.listEnseignant.set(
      this.listEnseignantSave().filter(e => e.departement?.id === idD)
    );
  }

  findEnseignantByPoste(event: Event): void {
    //  Typage correct de l'event au lieu de "any"
    const idP = Number((event.target as HTMLSelectElement).value);
    if (!idP) {
      this.listEnseignant.set(this.listEnseignantSave());
      return;
    }
    this.listEnseignant.set(
      this.listEnseignantSave().filter(e => e.poste?.id === idP)
    );
  }

  // Formulaire 

  resetForm(): void {
    this.enseignantForm.reset();
  }

  createEnseignant(): void {
    if (this.enseignantForm.invalid) return; //  Validation avant soumission

    const formData = new FormData();
    formData.append('enseignant', JSON.stringify(this.enseignantForm.value));

    this.utilisateurService.createEnseignant(formData).subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllEnseignant();
        this.enseignantForm.reset();
      },
      error: () => console.error('Erreur lors de la création d\'un enseignant'),
    });
  }

  //  Graph 

  /**
   * Construit les données labelDepartement et numberEnseignant
   * à partir de la liste des enseignants sauvegardée.
   */
  constructData(): void {
    const enseignants = this.listEnseignantSave();

    // Labels des départements (sans doublons)
    const unique = new Map<number, string>();
    enseignants.forEach(e => {
      if (e.departement && !unique.has(e.departement.id)) {
        unique.set(e.departement.id, e.departement.intitule);
      }
    });
    this.labelDepartement.set(Array.from(unique.values()));

    // Nombre d'enseignants par département
    const compteur = new Map<string, number>();
    enseignants.forEach(e => {
      if (e.departement) {
        const intitule = e.departement.intitule;
        compteur.set(intitule, (compteur.get(intitule) ?? 0) + 1);
      }
    });

    this.numberEnseignant.set(
      this.labelDepartement().map(label => compteur.get(label) ?? 0)
    );
  }

  getStats(): void {
    this.constructData();
    this.graphEvolutionEnseignantByDepartement();

    this.constructDataPoste();
    this.graphEnseignantParPoste();
  }

  graphEvolutionEnseignantByDepartement(): void {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;

    //  Vérification que le canvas existe bien dans le DOM
    if (!canvas) {
      console.error('Canvas #myChart introuvable dans le DOM');
      return;
    }

    //  Destruction de l'ancien chart avant d'en créer un nouveau
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) {
      console.error('Impossible d\'obtenir le contexte 2D du canvas');
      return;
    }

    const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(105, 108, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(105, 108, 255, 0.0)');

    //  Stockage de l'instance pour pouvoir la détruire plus tard
    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.labelDepartement(),
        datasets: [{
          label: 'Nombre d\'enseignants',
          data: this.numberEnseignant(),
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
              //  Affiche uniquement des entiers sur l'axe Y
              stepSize: 1,
              callback: (value) => Number.isInteger(value) ? value : null,
            },
          },
        },
      },
    });
  }


labelPoste = signal<string[]>([]);
numberEnseignantParPoste = signal<number[]>([]);

// 
private doughnutInstance: Chart | null = null;

constructDataPoste(): void {
  const enseignants = this.listEnseignantSave();

  // Labels des postes (sans doublons)
  const unique = new Map<number, string>();
  enseignants.forEach(e => {
    if (e.poste && !unique.has(e.poste.id)) {
      unique.set(e.poste.id, e.poste.intitule);
    }
  });
  this.labelPoste.set(Array.from(unique.values()));

  // Nombre d'enseignants par poste
  const compteur = new Map<string, number>();
  enseignants.forEach(e => {
    if (e.poste) {
      const intitule = e.poste.intitule;
      compteur.set(intitule, (compteur.get(intitule) ?? 0) + 1);
    }
  });

  this.numberEnseignantParPoste.set(
    this.labelPoste().map(label => compteur.get(label) ?? 0)
  );
}

// Génération du chart Doughnut 

graphEnseignantParPoste(): void {
  const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement | null;

  if (!canvas) {
    console.error('Canvas #doughnutChart introuvable dans le DOM');
    return;
  }

  if (this.doughnutInstance) {
    this.doughnutInstance.destroy();
    this.doughnutInstance = null;
  }

  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) {
    console.error('Impossible d\'obtenir le contexte 2D du canvas');
    return;
  }

  const colors = [
    '#696cff', '#ff6b6b', '#ffd93d',
    '#6bcb77', '#4d96ff', '#ff922b',
    '#cc5de8', '#20c997', '#f06595',
  ];

  this.doughnutInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: this.labelPoste(),
      datasets: [{
        label: 'Enseignants par poste',
        data: this.numberEnseignantParPoste(),
        backgroundColor: colors.slice(0, this.labelPoste().length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      cutout: '65%', //  Épaisseur de l'anneau
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13 },
          },
        },
        tooltip: {
          callbacks: {
            //  Affiche le % dans le tooltip
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