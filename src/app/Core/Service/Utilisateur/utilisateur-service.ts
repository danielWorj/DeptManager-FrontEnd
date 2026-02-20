import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enseignant } from '../../Model/Utilisateur/Enseignant';
import { DeptManager } from '../../Constant/EndPoints';
import { Etudiant } from '../../Model/Utilisateur/Etudiant';
import { ResponseServer } from '../../Model/Server/ResponseServer';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
    constructor(private http:HttpClient){}

    //Enseignant
    getAllEnseignant():Observable<Enseignant[]>{
      return this.http.get<Enseignant[]>(DeptManager.Utilisateur.Enseignant.all); 
    }

    getCountEnseignant():Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Enseignant.count); 
    }

     getAllEnseignantByDepartement(id:number):Observable<Enseignant[]>{
      return this.http.get<Enseignant[]>(DeptManager.Utilisateur.Enseignant.allbydepartement+id); 
    }

    createEnseignant(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.Enseignant.create, request);
    }

    updateEnseignant(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.Enseignant.update, request);
    }

    //Etudiant
    getAllEtudiant():Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.all); 
    }

    getCountEtudiant():Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Etudiant.count); 
    }

    getAllEtudiantByDepartement(id:number):Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbydepartement+id); 
    }
    
    getAllEtudiantByNiveau(id:number):Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbyniveau+id); 
    }
    
    getAllEtudiantByFiliereAndNiveau(id:number):Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbyFiliereAndNiveau+id); 
    }


}
