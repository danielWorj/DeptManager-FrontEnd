import { Enseignant } from "../Utilisateur/Enseignant";
import { Departement } from "./Departement";

export interface ChefDepartement extends Enseignant{
    id :number ; 
    enseignant : Enseignant; 
    departement : Departement; 
    diplome :string; 
    anneeexperience :number ; 
    bureau :string; 
    dateDebut:string ; 

}