import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Matiere } from '../../Model/Scolarite/Matiere';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { DeptManager } from '../../Constant/EndPoints';
import { Observable } from 'rxjs';
import { Documentation } from '../../Model/Scolarite/Document';

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

    
}
