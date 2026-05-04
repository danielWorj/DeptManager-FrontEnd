import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { DepartementForList } from '../../../Core/Model/Structure/Departement';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-departements',
  imports: [RouterLink],
  templateUrl: './departements.html',
  styleUrl: './departements.css',
})
export class Departements {
  constructor(private configService :ConfigService , private utilisateurService : UtilisateurService){
    this.constructDepartementForList();

  }

  listDepartements = signal<DepartementForList[]>([]); 
  listDepartementsSave = signal<DepartementForList[]>([]); 
  resultats : DepartementForList[] = []; 
  nbreEnseignant = signal<number>(0);
  nbreEtudiant = signal<number>(0);
  nbreDepartement = signal<number>(0); 
  nbreFiliere = signal<number>(0); 

  async constructDepartementForList(){
    let listDepartements = await this.configService.getAllDepartement().toPromise(); 

    for(const d of listDepartements!){
        let listFilieres = await this.configService.getAllFiliereByDepartement(d.id).toPromise(); 
        let numberEnseignants = await this.utilisateurService.getCountEnseignantByDepartement(d.id).toPromise(); 
        let numberEtudiant = await this.utilisateurService.getCountEtudiantByDepartement(d.id).toPromise(); 
        let medias = await this.configService.getAllMediaByDepartement(d.id).toPromise(); 
        let mediaDeProfil = medias?.find(m=> m.profil==true); 

        //count 
        this.nbreDepartement.set(this.nbreDepartement()+1);

        this.nbreEtudiant.set(this.nbreEtudiant() + numberEtudiant! ); 

        this.nbreEnseignant.set(this.nbreEnseignant() + numberEnseignants! ); 

        this.nbreFiliere.set(this.nbreFiliere() + listFilieres!.length ); 

        //objet 
        const departementForList : DepartementForList ={
          departement : d, 
          mediaProfil: mediaDeProfil!, 
          filieres: listFilieres!,
          nombreEnseignants: numberEnseignants!, 
          nombreEtudiants: numberEtudiant!,          
        }

        this.resultats.push(departementForList); 

    }


    this.listDepartements.set(this.resultats); 
    this.listDepartementsSave.set(this.resultats); 

    console.log('voici la liste des departements : ', this.listDepartements()); 

  }

   filter(id:number){
    this.listDepartements.set(this.listDepartementsSave().filter(d => d.departement.id==id)); 
   }

   resetFilter(){
    this.listDepartements.set(this.listDepartementsSave()); 
   }

}
