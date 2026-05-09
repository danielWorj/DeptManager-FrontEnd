import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enseignant } from '../../Model/Utilisateur/Enseignant';
import { DeptManager } from '../../Constant/EndPoints';
import { Etudiant } from '../../Model/Utilisateur/Etudiant';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { ChefDepartement } from '../../Model/Structure/ChefDepartement';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
    constructor(private http:HttpClient){}

    //Enseignant
    getAllEnseignant():Observable<Enseignant[]>{
      return this.http.get<Enseignant[]>(DeptManager.Utilisateur.Enseignant.all); 
    }
    getEnseignantByID(id:number):Observable<Enseignant>{
      return this.http.get<Enseignant>(DeptManager.Utilisateur.Enseignant.byId+id); 
    }

    getCountEnseignant():Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Enseignant.count); 
    }

    getCountEnseignantByDepartement(id:number):Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Enseignant.countByDepaterment+id); 
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

    deleteEnseignant(id:number):Observable<ResponseServer>{
      return this.http.delete<ResponseServer>(DeptManager.Utilisateur.Etudiant.delete+id);
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

    getCountEtudiantByFiliere(id:number):Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Etudiant.countByFiliere+id); 
    }
    
    getCountEtudiantByDepartement(id:number):Observable<number>{
      return this.http.get<number>(DeptManager.Utilisateur.Etudiant.countByDepaterment+id); 
    }
    getAllEtudiantByNiveau(id:number):Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbyniveau+id); 
    }
    
    getAllEtudiantByFiliereAndNiveau(id:number):Observable<Etudiant[]>{
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbyFiliereAndNiveau+id); 
    }
    getAllEtudiantByAnneeAndFiliereAndNiveau(idA:number,idF:number,idN:number):Observable<Etudiant[]>{
      
      return this.http.get<Etudiant[]>(DeptManager.Utilisateur.Etudiant.allbyAnneeAndFiliereAndNiveau+idA+'/'+idF+'/'+idN); 
    }

    createEtudiant(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.Etudiant.create, request);
    }

    updateEtudiant(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.Etudiant.update, request);
    }

    getEtudiantByID(id:number):Observable<Etudiant>{
      return this.http.get<Etudiant>(DeptManager.Utilisateur.Etudiant.byId+id); 
    }

    deleteEtudiant(id:number):Observable<ResponseServer>{
      return this.http.delete<ResponseServer>(DeptManager.Utilisateur.Etudiant.delete+id);
    }


    //CHEF DEPARTEMENT 

    getChefDepartementByID(id:number):Observable<ChefDepartement>{
      return this.http.get<ChefDepartement>(DeptManager.Utilisateur.ChefDepartement.byIdDept+id); 
    }
    createChefDepartement(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.ChefDepartement.create, request);
    }

    updateChefDepartement(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Utilisateur.ChefDepartement.update, request);
    }


    //CHANGEMENT STATUS 
    changeStatus(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Utilisateur.change+id); 
    }

}
