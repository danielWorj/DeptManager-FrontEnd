import { Filiere } from "../Structure/Filiere";
import { Niveau } from "../Structure/Niveau";
import { Utilisateur } from "./Utilisateur";

export interface Etudiant extends Utilisateur{ 
    matricule :string ; 
    filiere : Filiere;
    niveau : Niveau ; 
}