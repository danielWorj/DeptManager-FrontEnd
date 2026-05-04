import { CategorieActualite } from "./CategorieActualite";

export interface Actualite{
    id:number ; 
    titre : string;
    vedette : boolean; 
    description :string; 
    url :string; 
    datePublication : string; 
    categorieActualite : CategorieActualite; 
}