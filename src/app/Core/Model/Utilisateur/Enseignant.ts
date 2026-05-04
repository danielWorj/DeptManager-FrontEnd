import { Departement } from "../Structure/Departement";
import { Poste } from "./Poste";
import { Utilisateur } from "./Utilisateur";

export interface Enseignant extends Utilisateur{
    poste :Poste;
    departement ? : Departement ; 

}