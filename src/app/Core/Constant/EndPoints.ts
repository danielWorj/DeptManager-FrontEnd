const api = "http://localhost:8080/deptmanager/api"; 
const structureapi = `${api}/structure`; 



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
        Matiere:{
            all : `${structureapi}/matiere/all`,
            create : `${structureapi}/matiere/create`,
            update : `${structureapi}/matiere/update`,
            delete : `${structureapi}/matiere/delete`,
        }, 

    }
}