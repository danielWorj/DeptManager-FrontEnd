import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Filiere, FiliereForList } from '../../../Core/Model/Structure/Filiere';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-filieres',
  imports: [RouterLink],
  templateUrl: './filieres.html',
  styleUrl: './filieres.css',
})
export class Filieres {
  constructor(private configService : ConfigService , private utilisateurService :UtilisateurService){
      this.constructorFilieres(); 
  }

  listFilieres  = signal<FiliereForList[]>([]); 
  listFilieresSave  = signal<FiliereForList[]>([]); 
  resultatPartiel : FiliereForList[] =[];
  nbreEnseignant = signal<number>(0);
  nbreEtudiant = signal<number>(0);
  nbreDepartement = signal<number>(0); 
  nbreFiliere = signal<number>(0); 
  async constructorFilieres(){
    
    let departements = await this.configService.getAllDepartement().toPromise(); 
    //let numberEtudiant = await this.utilisateurService.getCountEtudiantByFiliere()

    for(const d of departements!){
      let fils = await this.configService.getAllFiliereByDepartement(d.id).toPromise(); 
      let numberEtudiant = await this.utilisateurService.getCountEtudiantByFiliere(d.id).toPromise(); 

      this.nbreFiliere.set(this.nbreFiliere() + fils?.length!); 
      this.nbreEtudiant.set(this.nbreEtudiant() + numberEtudiant!); 

      const filiereConstruct : FiliereForList = {
        departement : d, 
        filieres: fils!
      }

      this.resultatPartiel.push(filiereConstruct);
    }

    this.listFilieres.set(this.resultatPartiel); 

    console.log('List filiere construuites :', this.listFilieres()); 
  }

  filter(id:number){
    this.listFilieres.set(this.listFilieresSave().filter(d => d.departement.id==id)); 
   }

   resetFilter(){
    this.listFilieres.set(this.listFilieresSave()); 
   }
}
