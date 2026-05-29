import React from "react";
import "./PanelGestionA.css";
import { useState, useEffect } from "react";
import { faMusic, faPenSquare, faPlus, faFilter, faGear } from '@fortawesome/free-solid-svg-icons';
import { Home, Music, UserCog, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



export default function PanelGestionA() {

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [messageErreur, setMessageErreur] = useState(""); // Messages d'erreur -> ECRAN PRINCIPAL

    const [utilisateurEdit, setUtilisateurEdit] = useState(null);
    const [messagePopup, setMessagePopup] = useState("");
    const [messageSuccess, setMessageSuccess] = useState("");

    const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
        nom: "",
        prenom: "",
        login: "",
        mdp: "",
        idRole: "",
    });


    // Dictionnaire pour transformer idRole en texte lisible (3 rôles)
    const roles = {
        1: "Administrateur",
        2: "Editeur",
        3: "Utilisateur"
    };


    const [showNouvelUtilisateurPopup, setShowNouvelUtilisateurPopup] = useState(false);


    const API_URL_FETCH = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("token"); // On récupère le token depuis le sessionStorage -> pour les requêtes authentifiées
    // Variable Commune pour tous les appels fetch


    // UseEffect qui permet d'interdire le scroll de la page d'arrière plan quand une popup s'affiche
    useEffect(() => {
        const unePopupEstOuverte = utilisateurEdit || showNouvelUtilisateurPopup; // Si au moins une des popups est ouverte (true ou false dans la variable)
        document.body.style.overflow = unePopupEstOuverte ? "hidden" : "auto";  // Si une popup est ouverte désactive le scroll sur la page (met en hidden), sinon scroll auto
        return () => { document.body.style.overflow = "auto"; }; // Clear -> Quand le composant est détruit -> on repasse en auto
    }, [utilisateurEdit, showNouvelUtilisateurPopup]); // UseEffect se relance à chaque fois qu'un de ces 2 states change (true ou false)




    //HOOK UseEffect -> Charge une seule fois au montage
    useEffect(() => {
        getUtilisateurs();
    }, []);



    // ---------------------------------------------- //
    // ----------- FONCTION GET UTILISATEURS -------- //
    // ---------------------------------------------- //
    const getUtilisateurs = async () => {
        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Utilisateur.php`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            // Si le serveur répond correctement
            if (res.ok) {
                const utilisateursData = await res.json();
                setUtilisateurs(utilisateursData);


                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessageErreur(`Erreur HTTP : ${res.status}`);
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (error) {
            console.error("Erreur async :", error);
            setMessageErreur("Erreur lors du chargement des données.");
        }
    };
    // ---------------------------------------- //
    // ---- FIN FONCTION GET UTILISATEURS ----- //
    // ---------------------------------------- //





    /* ------------------------------------------------ */
    /* -------- FONCTION UPDATE UTILISATEUR --------- */
    /* ------------------------------------------------ */
    const updateUtilisateur = (user) => {

        setUtilisateurEdit({ ...user }); // Copie pour pas travailler avec state original
        setMessagePopup("");
    };

    // Dès qu'on appuie sur "Valider" après modification de l'utilisateur
    const handleUpdateUtilisateur = async () => {


        /* ------------ VERIFICATIONS ------------ */
        if (
            !utilisateurEdit.nom.trim() ||
            !utilisateurEdit.prenom.trim() ||
            !utilisateurEdit.login.trim() ||
            !utilisateurEdit.idRole
        ) {
            setMessagePopup("Tous les champs doivent être remplis !");
            return;
        }
        /* ---------- FIN VERIFICATIONS ---------- */


        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/UtilisateurActions.php`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json", // Indique que j'envoie du JSON dans mon body
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ // Transforme l'objet JS en JSON pour l'envoyer au serveur

                        // Au lieu de faire JSON.stringify(utilisateurEdit) qui enverrait TOUTES les données de l'utilisateur 
                        // J'envoie manuellement les données car je ne veux pas envoyer le mdp (même hash) et d'autres données sensibles ou inutiles pour la modification
                        idUtilisateur: utilisateurEdit.idUtilisateur,
                        nom: utilisateurEdit.nom,
                        prenom: utilisateurEdit.prenom,
                        login: utilisateurEdit.login,
                        idRole: Number(utilisateurEdit.idRole)
                    }),
                }
            );

            // Si le serveur répond correctement
            if (res.ok) {
                const data = await res.json();

                // Si la modification a réussi côté serveur
                if (data.success) {

                    // Mise à jour du state pour affichage 
                    setUtilisateurs(prev =>

                        //.map -> Parcourt le tableau + en retourne un nouveau avec les éléments modifiés 
                        prev.map(u => {

                            // Vérifie si c'est bien l'utilisateur modifié 
                            if (Number(u.idUtilisateur) === Number(utilisateurEdit.idUtilisateur)) {
                                return { ...u, ...utilisateurEdit }; // Si c'est lui -> on le remplace
                            }
                            return u; // Pas lui -> on le garde tel quel
                        })
                    );

                    setUtilisateurEdit(null); // Fermer le popup

                    // Message de succès
                    setMessageSuccess("Utilisateur modifié avec succès !");
                    setTimeout(() => setMessageSuccess(""), 3000);


                    // Erreur -> Le serveur a répondu OK mais l'API dit que la modif a échoué
                } else {
                    setMessagePopup(data.message || "Erreur lors de la modification !");
                }

                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessagePopup(`Erreur HTTP : ${res.status}`);
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error("Erreur update utilisateur :", err);
            setMessagePopup("Erreur réseau !");
        }
    };
    /* --------------------------------------- */
    /* --------- FIN FONCTION UPDATE --------- */
    /* --------------------------------------- */






    /* ---------------------------------------------------- */
    /* ----------- FONCTION DELETE UTILISATEUR ----------- */
    /* ---------------------------------------------------- */
    const deleteUtilisateur = async (idUtilisateur) => {

        // Confirmation de suppression 
        if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
            return;
        }

        setMessageErreur("");

        
        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/UtilisateurActions.php?idUtilisateur=${idUtilisateur}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            // Si le serveur répond correctement
            if (res.ok) {
                const data = await res.json();

                // Si la suppression a réussi côté serveur
                if (data.success) {


                    // Retirer l'utilisateur du state
                    setUtilisateurs(prev =>

                        // Nouveau tableau avec tous les utilisateurs sauf celui supprimé
                        prev.filter(u => {

                            // Si ce n'est pas l'utilisateur supprimé
                            if (u.idUtilisateur !== idUtilisateur) {
                                return true;  // Pas lui -> on le garde 
                            }
                            return false;     // C'est lui -> on le supprime
                        })
                    );


                    // Afficher le message de succès
                    setMessageSuccess("Utilisateur supprimé avec succès !");
                    setTimeout(() => { setMessageSuccess(""); }, 3000);


                    // Erreur -> Le serveur a répondu OK mais l'API dit que la suppression a échoué
                } else {
                    setMessageErreur(data.message || "Erreur lors de la suppression !");
                }

                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessageErreur(`Erreur HTTP : ${res.status}`);
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error("Erreur delete utilisateur :", err);
            setMessageErreur("Erreur réseau !");
        }
    };
    /* --------------------------------------- */
    /* --------- FIN FONCTION DELETE --------- */
    /* --------------------------------------- */






    /* --------------------------------------------------- */
    /* ----------- FONCTION CREATE UTILISATEUR ----------- */
    /* --------------------------------------------------- */
    const createUtilisateur = async () => {

        /* ------------ VERIFICATIONS ------------ */
        // Champs obligatoires
        if (
            !nouvelUtilisateur.nom.trim() ||
            !nouvelUtilisateur.prenom.trim() ||
            !nouvelUtilisateur.login.trim() ||
            !nouvelUtilisateur.mdp.trim() ||
            !nouvelUtilisateur.idRole
        ) {
            setMessagePopup("Veuillez remplir tous les champs !");
            return;
        }

        // Longueur login / mdp
        if (nouvelUtilisateur.login.length < 3) {
            setMessagePopup("Le login doit contenir au moins 3 caractères !");
            return;
        }

        if (nouvelUtilisateur.mdp.length < 6) {
            setMessagePopup("Le mot de passe doit contenir au moins 6 caractères !");
            return;
        }
        /* ---------- FIN VERIFICATIONS ---------- */


        try {
            const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/UtilisateurActions.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Je précise que j'envoie du JSON dans le corps de ma requête
                    "Authorization": `Bearer ${token}`
                },

                // Je transforme mon objet JavaScript en JSON pour l'envoyer avec stringify
                body: JSON.stringify({

                    // Je donne les champs manuellement probablement à cause du "Number"
                    nom: nouvelUtilisateur.nom,
                    prenom: nouvelUtilisateur.prenom,
                    login: nouvelUtilisateur.login,
                    mdp: nouvelUtilisateur.mdp,
                    idRole: Number(nouvelUtilisateur.idRole),
                }),
            });

            // Si le serveur répond correctement
            if (res.ok) {
                const data = await res.json();

                // Si la création a réussi côté serveur
                if (data.success) {

                    // Modifie le state d'utilisateurs
                    setUtilisateurs(prev => [...prev, data.utilisateur]); // Nouveau tableau avec tous les utilisateurs précédents + le nouvel utilisateur renvoyé par l'API
                    setNouvelUtilisateur({ nom: "", prenom: "", login: "", mdp: "", idRole: "" }); // Vider le formulaire après l'ajout 

                    // Message de succès 
                    setMessageSuccess("Utilisateur ajouté avec succès !");
                    setTimeout(() => setMessageSuccess(""), 3000);

                    return true; // Indique que la création a réussi pour fermer la popup


                    // Erreur -> Le serveur a répondu OK mais l'API dit que la création a échoué
                } else {
                    setMessagePopup(data.message || "Erreur lors de l'ajout !");
                    return false;
                }

                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessagePopup(`Erreur HTTP : ${res.status}`);
                return false;
            }

            //Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error("Erreur add utilisateur :", err);
            setMessagePopup("Erreur réseau !");
            return false;
        }
    };
    /* --------------------------------------- */
    /* --------- FIN FONCTION CREATE --------- */
    /* --------------------------------------- */






    // --------- AFFICHAGE ECRAN --------- 
    return (
        <div className="PGA-panel-utilisateurs">
            <div className="PGA-titre-panel">
                <div className="PGA-title-content">
                    <div className="PGA-title-icon">
                        <UserCog size={26} strokeWidth={2.2} />
                    </div>
                    <h1 className="PGA-titre">
                        Gestion des utilisateurs
                    </h1>
                </div>
            </div>


            {/* Bouton d'ajout d'utilisateur */}
            <div className="PGA-zone-actions-haut">
                <button
                    className="PGA-bouton-ajouter"
                    onClick={() => {
                        setMessagePopup("");
                        setNouvelUtilisateur({ // Réinitialise le formulaire d'ajout à chaque ouverture de la popup
                            nom: "",
                            prenom: "",
                            login: "",
                            mdp: "",
                            idRole: "",
                        });
                        setShowNouvelUtilisateurPopup(true); // Affiche la popup d'ajout
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                    Ajouter un utilisateur
                </button>
            </div>

            {/* Messages */}
            {messageErreur && <p className="PGA-message-erreur-global">{messageErreur}</p>}
            {messageSuccess && <p className="PGA-message-success-global">{messageSuccess}</p>}


            {/* Liste des utilisateurs */}
            <div className="PGA-conteneur-tableau">
                <table className="PGA-table-utilisateurs">
                    <thead className="PGA-entete-tableau">
                        <tr className="PGA-ligne-entete">
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Login</th>
                            <th>Rôle</th>
                            <th className="PGA-colonne-actions">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="PGA-corps-tableau">

                        {/* Vérifie que le tableau d'utilisateurs n'est pas vide */}
                        {utilisateurs.length > 0 ? (

                            // Parcourt le tableau d'utilisateurs et affiche une ligne pour chaque utilisateur
                            utilisateurs.map((user) => (
                                <tr key={user.idUtilisateur} className="PGA-ligne-utilisateur">
                                    <td>{user.idUtilisateur}</td>
                                    <td>{user.nom}</td>
                                    <td>{user.prenom}</td>
                                    <td className="PGA-cellule-login">
                                        {user.login}
                                    </td>

                                    {/* Afficher le rôle de l'utilisateur */}
                                    <td>
                                        <span
                                            className={`PGA-badge-role PGA-role-${roles[user.idRole]}`}
                                        >
                                            {roles[user.idRole] || "Rôle inconnu"}
                                        </span>
                                    </td>


                                    {/* Boutons d'action dans la liste */}
                                    <td className="PGA-cellule-actions">
                                        <button
                                            className="PGA-bouton-modifier"
                                            onClick={() => updateUtilisateur(user)}
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            className="PGA-bouton-supprimer"
                                            onClick={() => deleteUtilisateur(user.idUtilisateur)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="PGA-ligne-vide">
                                <td colSpan="6" className="PGA-cellule-vide">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>



            {/* ------------------------------------------ */}
            {/* ---- POPUP DE MODIFICATION -> UTILISATEUR ---- */}
            {/* ------------------------------------------ */}
            {
                // Vérifie qu'utilisateurEdit n'est pas null 
                utilisateurEdit && (
                    <>

                        {/* Si on clique sur l'arrière plan pendant qu'on est dans le popup -> fermeture */}
                        <div className="PGA-popup-edit-overlay" onClick={() => setUtilisateurEdit(null)}></div>
                        <div className="PGA-popup-edit">
                            <h3>Modifier l'utilisateur</h3>

                            {/* Nom */}
                            <label>
                                Nom :
                                <input
                                    type="text"
                                    value={utilisateurEdit.nom}
                                    placeholder="Nouveau nom"
                                    onChange={(e) =>
                                        setUtilisateurEdit({ ...utilisateurEdit, nom: e.target.value })
                                        // On met à jour le state utilisateurEdit à chaque modification des champs du formulaire -> 
                                        // copie de l'objet actuel avec spread et on écrase la propriété modifiée 

                                    }
                                />
                            </label>

                            {/* Prénom */}
                            <label>
                                Prénom :
                                <input
                                    type="text"
                                    value={utilisateurEdit.prenom}
                                    placeholder="Nouveau prénom"
                                    onChange={(e) =>
                                        setUtilisateurEdit({ ...utilisateurEdit, prenom: e.target.value })
                                    }
                                />
                            </label>

                            {/* Login */}
                            <label>
                                Login :
                                <input
                                    type="text"
                                    value={utilisateurEdit.login}
                                    placeholder="Nouveau login"
                                    onChange={(e) =>
                                        setUtilisateurEdit({ ...utilisateurEdit, login: e.target.value })
                                    }
                                />
                            </label>

                            {/* Rôle -> liste déroulante */}
                            <label>
                                Rôle :
                                <select
                                    className="PGA-select"
                                    value={utilisateurEdit.idRole}
                                    onChange={(e) =>
                                        setUtilisateurEdit({ ...utilisateurEdit, idRole: Number(e.target.value), }) // Vérifie si changement du rôle avec la liste déroulante + met à jour le state en conséquence
                                    }
                                >
                                    {/* La liste des rôles */}
                                    <option value="" disabled>
                                        -- Choisir un rôle --
                                    </option>

                                    {/* Object.entries -> Convertit l'objet roles en tableau de paires (clé, valeur) [id, libelle] car peut pas maper sur un objet */}
                                    {Object.entries(roles).map(([id, libelle]) => (
                                        // Donc un rôle = un id et un libellé -> on crée une option pour chaque rôle

                                        // Pour chaque option, on met comme valeur l'id du rôle et comme texte affiché le libellé du rôle
                                        <option key={id} value={id}>
                                            {libelle}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Message d'erreur dans popup */}
                            {messagePopup && <p className="PGA-popup-message">{messagePopup}</p>}

                            {/* Boutons */}
                            <button className="PGA-btn-validate" onClick={handleUpdateUtilisateur}>
                                Valider
                            </button>

                            <button className="PGA-btn-cancel" onClick={() => setUtilisateurEdit(null)}>
                                Annuler
                            </button>
                        </div>
                    </>
                )
            }

            {/* ------------------------------------------ */}
            {/* ---- POPUP DE CREATION -> UTILISATEUR ---- */}
            {/* ------------------------------------------ */}
            {
                showNouvelUtilisateurPopup && (
                    <>
                        {/* Si on clique sur l'arrière plan pendant qu'on est dans le popup -> fermeture */}
                        <div className="PGA-popup-edit-overlay" onClick={() => setShowNouvelUtilisateurPopup(false)}></div>
                        <div className="PGA-popup-edit">
                            <h3>Ajouter un utilisateur</h3>

                            {/* Nom */}
                            <label>
                                Nom :
                                <input
                                    type="text"
                                    value={nouvelUtilisateur.nom}
                                    placeholder="Nom"
                                    onChange={(e) =>
                                        setNouvelUtilisateur({ ...nouvelUtilisateur, nom: e.target.value })
                                    }
                                />
                            </label>

                            {/* Prénom */}
                            <label>
                                Prénom :
                                <input
                                    type="text"
                                    value={nouvelUtilisateur.prenom}
                                    placeholder="Prénom"
                                    onChange={(e) =>
                                        setNouvelUtilisateur({ ...nouvelUtilisateur, prenom: e.target.value })
                                    }
                                />
                            </label>

                            {/* Login */}
                            <label>
                                Login :
                                <input
                                    type="text"
                                    value={nouvelUtilisateur.login}
                                    placeholder="Login"
                                    onChange={(e) =>
                                        setNouvelUtilisateur({ ...nouvelUtilisateur, login: e.target.value })
                                    }
                                />
                            </label>

                            {/* Mot de passe */}
                            <label>
                                Mot de passe :
                                <input
                                    type="password"
                                    value={nouvelUtilisateur.mdp}
                                    placeholder="Mot de passe"
                                    onChange={(e) =>
                                        setNouvelUtilisateur({ ...nouvelUtilisateur, mdp: e.target.value })
                                    }
                                />
                            </label>

                            {/* Rôle -> liste déroulante (même principe que pour l'update*/}
                            <label>
                                Rôle :
                                <select
                                    className="PGA-select"
                                    value={nouvelUtilisateur.idRole}
                                    onChange={(e) =>
                                        setNouvelUtilisateur({ ...nouvelUtilisateur, idRole: Number(e.target.value), })
                                    }
                                >
                                    <option value="" disabled>
                                        -- Choisir un rôle --
                                    </option>

                                    {/* Object.entries -> Convertit l'objet roles en tableau de paires (clé, valeur) [id, libelle] car peut pas maper sur un objet */}
                                    {Object.entries(roles).map(([id, libelle]) => (

                                        // Pour chaque option, on met comme valeur l'id du rôle et comme texte affiché le libellé du rôle
                                        <option key={id} value={id}>
                                            {libelle}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Message d'erreur dans popup */}
                            {messagePopup && <p className="PGA-popup-message">{messagePopup}</p>}

                            {/* Boutons */}
                            <button
                                className="PGA-btn-validate"
                                onClick={async () => {
                                    const success = await createUtilisateur(); // Ici, createUtilisateur retourne true ou false selon que la création a réussi ou pas -> pour fermer la popup seulement si la création a réussi
                                    if (success) setShowNouvelUtilisateurPopup(false); // Fermer la popup si la création a bien réussi
                                }}
                            >
                                Ajouter
                            </button>

                            <button
                                className="PGA-btn-cancel"
                                onClick={() => setShowNouvelUtilisateurPopup(false)}
                            >
                                Annuler
                            </button>
                        </div>
                    </>
                )
            }

        </div >
    )

};