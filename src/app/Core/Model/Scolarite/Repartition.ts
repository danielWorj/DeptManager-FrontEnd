import { Filiere } from "../Structure/Filiere";
import { Niveau } from "../Structure/Niveau";
import { Enseignant } from "../Utilisateur/Enseignant";
import { Matiere } from "./Matiere";
import { Semestre } from "./Semestre";

export interface Repartition{
    id:number; 
    enseignant : Enseignant;
    filiere : Filiere;
    niveau : Niveau ;
    matiere : Matiere; 
    semestre : Semestre
}