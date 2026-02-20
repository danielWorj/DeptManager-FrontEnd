const api = "http://localhost:8080/deptmanager/api"; 
const structureapi = `${api}/structure`; 
const scolariteapi = `${api}/scolarite`; 
const horaireapi = `${api}/horaire`; 
const utilisateurapi = `${api}/utilisateur`; 



export const DeptManager ={
    
    Config: {
        Departement :{
            all : `${structureapi}/departement/all`,
            create : `${structureapi}/departement/create`,
            update : `${structureapi}/departement/update`,
            delete : `${structureapi}/departement/delete/`,
        }, 
        Filiere:{
            all : `${structureapi}/filiere/all`,
            allByDepartemet : `${structureapi}/filiere/all`,
            create : `${structureapi}/filiere/create`,
            update : `${structureapi}/filiere/update`,
            delete : `${structureapi}/filiere/delete`,
        }, 
        Niveau:{
            all : `${structureapi}/niveau/all`,
            create : `${structureapi}/niveau/create`,
            update : `${structureapi}/niveau/update`,
            delete : `${structureapi}/niveau/delete`,
        },
        Salle:{
            all : `${structureapi}/salle/all`,
            create : `${structureapi}/salle/create`,
            update : `${structureapi}/salle/update`,
            delete : `${structureapi}/salle/delete`,
        },
        Poste:{
            all : `${structureapi}/poste/all`,
            create : `${structureapi}/poste/create`,
            update : `${structureapi}/poste/update`,
            delete : `${structureapi}/poste/delete`,
        },
        
    }, 
    Scolarite :{
        Matiere:{
            all : `${scolariteapi}/matiere/all`,
            allByFiliere : `${scolariteapi}/matiere/all/byfiliere/`,
            allByDepartement : `${scolariteapi}/matiere/all/bydepartement/`,
            create : `${scolariteapi}/matiere/create`,
            update : `${scolariteapi}/matiere/update`,
            delete : `${scolariteapi}/matiere/delete`,
        }, 
    }, 
    Horaire:{
        create : `${horaireapi}/create`, 
        update : `${horaireapi}/update`, 
        allByFiliereAndNiveau : `${horaireapi}/all/byfiliere/andniveau/`, 
        allByEnseignant : `${horaireapi}/all/byenseignant/`, 

        Jour:{
            all : `${horaireapi}/jour/all`,
            create : `${horaireapi}/jour/create`,
            update : `${horaireapi}/jour/update`,
            delete : `${horaireapi}/jour/delete`,
        }, 
        Periode :{
            all : `${horaireapi}/periode/all`, 
            create : `${horaireapi}/periode/create`, 
            update : `${horaireapi}/periode/update`, 
            delete : `${horaireapi}/periode/delete`, 
        }
        
    },
    Utilisateur :{
        Enseignant :{
            all : `${utilisateurapi}/enseignant/all`, 
            count : `${utilisateurapi}/enseignant/count`, 
            create : `${utilisateurapi}/enseignant/create`, 
            update : `${utilisateurapi}/enseignant/update`, 
            allbydepartement : `${utilisateurapi}/enseignant/bydepartement/`, 
        }, 
        Etudiant :{
            all : `${utilisateurapi}/etudiant/all`, 
            count : `${utilisateurapi}/etudiant/count`, 
            allbydepartement : `${utilisateurapi}/etudiant/bydepartement/`, 
            allbyniveau : `${utilisateurapi}/etudiant/byniveau/`, 
            allbyFiliereAndNiveau : `${utilisateurapi}/etudiant/byfiliere/byniveau/`, 
        }, 
    }
}