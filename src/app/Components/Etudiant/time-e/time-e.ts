import { Component, signal } from '@angular/core';
import { UtilisateurService } from '../../../Core/Service/Utilisateur/utilisateur-service';
import { ScolariteService } from '../../../Core/Service/Scolarite/scolarite-service';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Etudiant } from '../../../Core/Model/Utilisateur/Etudiant';
import { HoraireService } from '../../../Core/Service/Horaire/horaire-service';
import { Horaire } from '../../../Core/Model/Horaire/Horaire';

@Component({
  selector: 'app-time-e',
  imports: [],
  templateUrl: './time-e.html',
  styleUrl: './time-e.css',
})
export class TimeE {
  idEtudiant = signal<number>(0); 
  constructor(
    private utilisateurService :UtilisateurService,
    private evaluationService : EvaluationService,   
    private scolariteService:ScolariteService , 
    private configService:ConfigService,
    private horaireService : HoraireService
  ){
    //this.idEtudiant.set(parseInt(sessionStorage.getItem("id")!));
    
    this.idEtudiant.set(2)
  }

  //GET ETUDIANT BY ID
  etudiantConnected = signal<Etudiant|null>(null); 
  getEtudiantById(id:number){
    this.utilisateurService.getEtudiantByID(id).subscribe({
      next:(data:Etudiant)=>{
        this.etudiantConnected.set(data)
      }, 
      error:(err)=>console.log('Fetch etudiant by id : failed'), 
    }); 
  }
  

  //GET HORAIRE ETUDIANT
  listHoraire = signal<Horaire[]>([]); 
  getAllHoraireByEtudiant(idF:number, idN:number){
    this.horaireService.getAllHoraireByFiliereAndNiveau(idF, idN).subscribe({
      next:(data:Horaire[])=>{
        this.listHoraire.set(data); 
      }, 
      error:(err)=>console.log('Fetch horaire by filiere and niveau  : failed'), 
    });
  }

}
