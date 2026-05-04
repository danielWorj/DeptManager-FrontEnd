import { Departement } from "./Departement";

export interface Media{
    id :number ; 
    url : string ; 
    departement: Departement; 
    profil : boolean; 
}