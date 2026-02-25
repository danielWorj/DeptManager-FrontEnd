import { Etudiant } from "../Utilisateur/Etudiant";
import { MotifRequete } from "./MotifRequete";
import { StatutRequete } from "./StatutRequete";

export interface Requete{
    id : number; 
    description : string ; 
    motifRequete : MotifRequete ; 
    dateCreation : string; 
    statutRequete : StatutRequete; 
    etudiant : Etudiant; 
}