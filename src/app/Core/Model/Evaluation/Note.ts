import { Repartition } from "../Scolarite/Repartition";
import { Etudiant } from "../Utilisateur/Etudiant";
import { TypeEvaluation } from "./TypeEvaluation";

export interface Note{
    id : number ; 
    note : number ; 
    repartition : Repartition; 
    typeEvaluation : TypeEvaluation; 
    etudiant :Etudiant; 
}