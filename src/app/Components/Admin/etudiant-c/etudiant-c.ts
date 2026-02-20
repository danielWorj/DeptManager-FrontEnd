import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';

@Component({
  selector: 'app-etudiant-c',
  imports: [],
  templateUrl: './etudiant-c.html',
  styleUrl: './etudiant-c.css',
})
export class EtudiantC {
  constructor(private configService:ConfigService, private utilisateurService :UtilisateurService){}

  listEtudiant = signal<Etudiant[]>([]); 

  getAllETudiant(){
    this.utilisateurService.getAllEtudiant().subscribe({
      next:(data : Etudiant[])=>{
        this.listEtudiant.set(data); 
      }, 
      error:()=>{
        console.log('Fecth list enseignant : failed'); 
      }
    }); 
  }

  getAllEtudiantByDepartement(id:number){
     this.utilisateurService.getAllEtudiantByDepartement(id).subscribe({
      next:(data : Etudiant[])=>{
        this.listEtudiant.set(data); 
      }, 
      error:()=>{
        console.log('Fecth list etudiant  by departement: failed'); 
      }
    });
  }

  getAllEtudiantByNiveau(id:number){
     this.utilisateurService.getAllEtudiantByNiveau(id).subscribe({
      next:(data : Etudiant[])=>{
        this.listEtudiant.set(data); 
      }, 
      error:()=>{
        console.log('Fecth list etudiant  by niveau: failed'); 
      }
    });
  }

}
