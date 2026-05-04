import { Departement } from "../Structure/Departement";

export interface Matiere{
    id : number; 
    intitule : string ; 
    code : string ; 
    credit :number; 
    seance :number;
    departement : Departement; 
    
}