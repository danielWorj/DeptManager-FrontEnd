import { Component } from '@angular/core';
import { DepartementC } from "../departement-c/departement-c";
import { MatiereC } from "../matiere-c/matiere-c";
import { FiliereC } from "../filiere-c/filiere-c";
import { SalleC } from "../salle-c/salle-c";
import { Annee } from "../annee/annee";

@Component({
  selector: 'app-configuration',
  imports: [DepartementC, MatiereC, FiliereC, SalleC, Annee],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css',
})
export class Configuration {

}
