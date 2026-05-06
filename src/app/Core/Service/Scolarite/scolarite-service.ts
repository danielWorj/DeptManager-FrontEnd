import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Matiere } from '../../Model/Scolarite/Matiere';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { DeptManager } from '../../Constant/EndPoints';
import { Observable } from 'rxjs';
import { Documentation } from '../../Model/Scolarite/Document';
import { MotifRequete } from '../../Model/Requete/MotifRequete';
import { Requete } from '../../Model/Requete/Requete';
import { PieceJointeRequete } from '../../Model/Requete/PieceJointeRequete';
import { Repartition } from '../../Model/Scolarite/Repartition';
import { Semestre } from '../../Model/Scolarite/Semestre';
import { AnneeAcademique } from '../../Model/Scolarite/anneeacademique';

@Injectable({
  providedIn: 'root',
})
export class ScolariteService {
    constructor(private http:HttpClient){

    }

    //Matiere 
    
    getAllMatiere():Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.all)
    }

    getAllMatiereByFiliere(id:number):Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.allByFiliere+id);
    }

    getAllMatiereByDepartement(id:number):Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.allByDepartement+id); 
    }
  
    createMatiere(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Matiere.create,request);
    }
  
    updateMatiere(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Matiere.update,request);
    }
  
    deleteMatiere(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Matiere.delete+id);
    }

    //
    
    //Documentation :

    getAllDocument():Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.all);
    }

    getAllDocumentByDepartement(id:number):Observable<Documentation[]>{  
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    } 

    getCountDocument():Observable<number>{
      return this.http.get<number>(DeptManager.Scolarite.Document.count);
    } 

    createDocument(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Document.create,request);
    } 

    updateDocument(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Document.update,request);
    }

    deleteDocument(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Document.delete+id);
    } 

    getAllDocumentByType(type:string):Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+type);
    }

    getAllDocumentByFiliere(id:number):Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    }

    getAllDocumentByNiveau(id:number):Observable<Documentation[]>{   
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    }

    getAllDocumentByMatiere(id:number):Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    }

    getAllDocumentByEnseignant(id:number):Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    }

    getAllDocumentByAnnee(id:number):Observable<Documentation[]>{
      return this.http.get<Documentation[]>(DeptManager.Scolarite.Document.allbydepartement+id);
    }


    //Requete 
    getAllRequete():Observable<Requete[]>{  
      return this.http.get<Requete[]>(DeptManager.Scolarite.Revendication.Requete.all);
    } 

    createRequete(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Revendication.Requete.create,request);
    } 

    changeRequeteStatut(idR:number , idS:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Revendication.Requete.change+idR+'/'+idS);
    } 

    updateRequete(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Revendication.Requete.update,request);
    }

    deleteRequete(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Revendication.Requete.delete+id);
    } 

    //Motif
    getAllMotifRequete():Observable<MotifRequete[]>{  
      return this.http.get<MotifRequete[]>(DeptManager.Scolarite.Revendication.MotifRequete.all);
    } 

    //Pieces jointes 
    getAllPieceJointeByRequete(id:number):Observable<PieceJointeRequete[]>{  
      return this.http.get<PieceJointeRequete[]>(DeptManager.Scolarite.Revendication.Requete.change+id);
    } 




    //Repartition 

    getAllRepartition():Observable<Repartition[]>{
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.all);
    }

    getAllRepartitionByEnseignant(id:number):Observable<Repartition[]>{   
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allByEnseignant+id);
    }
    
    getAllRepartitionByFiliere(id:number):Observable<Repartition[]>{   
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allByFiliere+id);
    }

    getAllRepartitionByMatiere(id:number):Observable<Repartition[]>{   
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allByMatiere+id);
    }

    getAllRepartitionBySemestre(id:number):Observable<Repartition[]>{   
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allBySemestre+id);
    }

    getAllRepartitionByFiliereAndNiveau(idF:number, idN:number):Observable<Repartition[]>{   
      console.log(DeptManager.Scolarite.Repartition.allByFiliereNiveau+idF+'/'+idN); 
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allByFiliereNiveau+idF+'/'+idN);
    }

    getAllRepartitionByFiliereAndNiveauAndSemestre(idF:number, idN:number , idS:number):Observable<Repartition[]>{   
      return this.http.get<Repartition[]>(DeptManager.Scolarite.Repartition.allByFiliereNiveauAndSemestre+idF+'/'+idN+'/'+idS);
    }

    createRepartition(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Repartition.create,request);
    }

    updateRepartition(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Repartition.update,request);
    }
    deleteRepartition(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Repartition.delete+id);
    }

    //Semeestre

    getAllSemestre():Observable<Semestre[]>{  
      return this.http.get<Semestre[]>(DeptManager.Scolarite.Semestre.all);
    } 


    // //Get All Annee Academique

    // getAllAnneeAcademique():Observable<AnneeAcademique[]>{  
    //   return this.http.get<AnneeAcademique[]>(DeptManager.Scolarite.AnneeAcademique.all);
    // }
}
