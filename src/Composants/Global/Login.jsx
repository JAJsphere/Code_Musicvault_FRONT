import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ setUser }) {

    // Ce que l'utilisateur tape dans les champs 
    const [login, setLogin] = useState(""); // Nom d'utilisateur
    const [password, setPassword] = useState(""); // Mot de passe

    const [messageErreur, setMessageErreur] = useState(""); // Message d'erreur

    const navigate = useNavigate(); // Hook pour la navigation (redirect après connexion ou changement de mot de passe)

    // States pour le mot de passe à changer à la première connexion    
    const [doitChangerMdp, setDoitChangerMdp] = useState(false); // Indique si l'utilisateur doit changer son mot de passe à la première connexion
    const [nouveauMdp, setNouveauMdp] = useState(""); // Nouveau mot de passe que l'utilisateur veut mettre à la place de celui temporaire
    const [confirmMdp, setConfirmMdp] = useState(""); // Confirmation du nouveau mot de passe


    const API_URL_FETCH = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("token"); // On récupère le token depuis le sessionStorage -> pour les requêtes authentifiées






    // ------------------------------------------ //
    // ------- FONCTION AUTHENTICATEUSER -------- //
    // ---------------------------------------- //

    // FORMULAIRE DE CONNEXION -> Envoie les données au serveur pour vérifier les identifiants et récupérer le token -> puis redirection / connexion 
    const authenticateUser = async (e) => {

        e.preventDefault(); // Empêche la page de se recharger lors de la soumission du formulaire 
        setMessageErreur(""); // Réinitialise le message d'erreur à chaque nouvelle tentative de connexion  

        try {

            // Envoie des données entrées dans le formulaire par l'utilisateur (login / mdp) à l'API
            const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Login.php`,
                {
                    method: "POST", // On envoie en POST car données sensibles et on crée une session côté serveur
                    headers: {
                        "Content-Type": "application/json", // Je t'envoie du JSON dans le corps 
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ login, password }), // Je transforme mes données de connexion en JSON pour les envoyer au serveur
                }
            );


            // Si le serveur répond correctement
            if (res.ok) {
                const data = await res.json();


                // Si la création de session a réussi côté serveur
                if (data.success) {

                    const idRoleNum = Number(data.idRole); // Force l'id role renvoyé par l'API en nombre (car parfois peut être envoyé en string selon la config du serveur) 
                    // Le serveur m'a renvoyé dans sa réponse, le token d'authentification + l'id du rôle de l'utilisateur connecté (un objet qui contient plein d'infos sur l'utiliasteur)

                    // Grâce à l'id du role renvoyé par l'API pour tel utilisateur, je vérifie à quel rôle correspond cet id (pour contrôler l'accès aux routes et fonctionnalités de l'app selon le rôle de l'utilisateur)
                    let role;
                    if (idRoleNum === 1)
                        role = "admin";
                    else if (idRoleNum === 2)
                        role = "editeur";
                    else
                        role = "user";


                    // Première connexion -> afficher les champs de changement de mdp
                    if (data.doitChangerMdp) { // Le serveur m'a renvoyé (dans l'objet) un booléen indiquant si l'utilisateur doit changer son mot de passe 

                        sessionStorage.setItem("token", data.token); // Stocke le token même en cas de première connexion -> nécessaire  pour savoir quel utilisateur change son mot de passe 
                        sessionStorage.setItem("role", role);  // Stocke le rôle même en cas de première connexion -> nécessaire pour la redirection après changement de mot de passe
                        setDoitChangerMdp(true); // Affiche les champs de changement de mot de passe dans le formulaire (fait apparaître la div car true -> fonction changerMdp est soumise à la place de authenticateUser lors de la soumission du formulaire)
                        return;
                    }


                    // Connexion normale (sans première connexion) -> stockage + redirection
                    sessionStorage.setItem("token", data.token); // Token -> Pour les requêtes authentifiées -> prouve que je suis connecté 
                    sessionStorage.setItem("role", role); // Role -> Pour les routes protégées et la redirection après connexion
                    sessionStorage.setItem("idUtilisateur", data.idUtilisateur); // Id -> Pour savoir quel utilisateur fait les actions

                    // Modifie la valeur du state user -> setUser dit à App.jsx "l'utilisateur est connecté, tu peux arrêter d'afficher uniquement le login et débloquer le reste de l'app".
                    // Car le state est vide au départ -> App.jsx affiche que le login car pour lui, personne n'est connecté
                    // Dès que le state change, App.jsx détecte que user n'est plus vide -> il affiche le reste de l'app selon le rôle de l'user
                    setUser({
                        role: role,
                        id: data.idUtilisateur,
                        // Stocke le rôle et l'id pour que les routes protégées et les fonctionnalités de l'app sachent qui est connecté et ce qu'il a le droit de faire selon son rôle
                    });


                    // Redirection selon le rôle de l'utilisateur
                    if (role === "admin")
                        navigate("/Acatalogue");
                    else if (role === "editeur")
                        navigate("/Ecatalogue");
                    else
                        navigate("/Ucatalogue");


                    // Erreur -> Le serveur a répondu OK mais l'API dit que la connexion a échoué
                } else {
                    setMessageErreur(data.message || "Identifiants incorrects");
                }

                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessageErreur(`Erreur HTTP : ${res.status}`);
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error(err);
            setMessageErreur("Erreur serveur, réessaie plus tard");
        }
    };
    // ------------------------------------------ //    
    // ----- FIN FONCTION AUTHENTICATEUSER ------ //
    // ------------------------------------------ //






    // -------------------------------------- //    
    // -------- FONCTION CHANGERMDP --------- //
    // -------------------------------------- //
    // Au moment de l'affichage de la div de changement de mot de passe (dès que doitChangerMdp devient true) 
    const changerMdp = async (e) => {

        e.preventDefault(); // Empêche la page de se recharger lors de la soumission du formulaire
        setMessageErreur(""); // Réinitialise le message d'erreur à chaque nouvelle tentative de changement de mot de passe

        /* --------- VERFICIATIONS ---------*/

        // On vérifie que les mdp correspondent (Nouveau mdp, et mdp confirmation)
        if (nouveauMdp !== confirmMdp) {
            setMessageErreur("Les mots de passe ne correspondent pas");
            return;
        }

        // On vérifie que le nouveau mot de passe respecte critères de longueur 
        if (nouveauMdp.length < 6) {
            setMessageErreur("Minimum 6 caractères");
            return;
        }
        /* ------- FIN VERFICIATIONS -------*/


        try {
            const token = sessionStorage.getItem("token"); // Récupère le token depuis le sessionStorage pour l'envoyer dans l'en-tête de la requête authentifiée

            const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/UtilisateurActions.php`, {
                method: "PATCH", // Modification uniquemenet du mot de passe 
                headers: {
                    "Content-Type": "application/json", // Je t'envoie du JSON dans le corps de la requête
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ nouveauMdp }), // Je transforme le nouveau mot de passe en JSON pour l'envoyer au serveur dans le corps de la requête
            });


            // Si le serveur répond correctement
            if (res.ok) {
                const data = await res.json();

                // Si le changement de mot de passe n'a pas réussi côté serveur
                if (!data.success) {

                    // Serveur a répondu mais l'API dit que le changement de mot de passe a échoué
                    setMessageErreur(data.message || "Erreur lors du changement de mot de passe");
                    return;
                }

                // Erreur -> Le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessageErreur("Erreur serveur, réessaie plus tard");
                return;
            }


            // Si le changement de mot de passe a réussi -> redirection selon le rôle de l'utilisateur
            const role = sessionStorage.getItem("role"); // Récupère le rôle depuis le sessionStorage pour savoir où rediriger l'utilisateur 
            if (role === "admin")
                navigate("/Acatalogue");
            else if (role === "editeur")
                navigate("/Ecatalogue");
            else
                navigate("/Ucatalogue");


            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error(err);
            setMessageErreur("Erreur serveur, réessaie plus tard");
        }
    };
    // -------------------------------------- //    
    // ----------- FIN CHANGERMDP ----------- //
    // -------------------------------------- ///






    // -------------------------------------- //
    // --------- AFFICHAGE VISUEL  ---------- //
    // -------------------------------------- //
    return (
        <div className="Login-conteneur">
            <div className="Login-carte">
                <h2 className="Login-titre">Connexion</h2>

                {/* Formulaire de connexion ou de changement de mot de passe */}
                <form className="Login-formulaire" onSubmit={doitChangerMdp ? changerMdp : authenticateUser}> {/* Si doitChangerMdp est vrai -> on soumet le formulaire au changement de mot de passe, 
                                                                                                                    sinon on le soumet à l'authentification normale */}

                    {/* Champ de saisie du nom d'utilisateur */}
                    <div className="Login-champ">
                        <label className="Login-label" htmlFor="login">
                            Nom d'utilisateur
                        </label>
                        <input
                            id="login"
                            type="text"
                            placeholder="Nom d'utilisateur"
                            value={login} // Valeur que contient l'input actuellement
                            onChange={(e) => setLogin(e.target.value)} // A chaque fois que l'utilisateur tape quelque chose dans le champ, on met à jour le state "login" avec la valeur actuelle du champ de saisie
                            className="Login-input"
                            required
                        />
                    </div>

                    {/* Champ de saisie du mot de passe */}
                    <div className="Login-champ">
                        <label className="Login-label" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="Login-input"
                            required
                        />
                    </div>


                    {/* Div qui s'ouvre quand l'utilisateur doit changer son mot de passe à la première connexion*/}

                    {/* Vérifie si doitChangerMdp est vrai*/}
                    {doitChangerMdp && (
                        <div className="Login-changer-mdp">
                            <p className="Login-info">Première connexion — choisis ton nouveau mot de passe</p>

                            {/* Champ de saisie du nouveau mot de passe */}
                            <div className="Login-champ">
                                <label className="Login-label" htmlFor="nouveauMdp">Nouveau mot de passe</label>
                                <input
                                    id="nouveauMdp"
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                    value={nouveauMdp}
                                    onChange={(e) => setNouveauMdp(e.target.value)}
                                    className="Login-input"
                                    required
                                />
                            </div>


                            {/* Champ de saisie de la confirmation du nouveau mot de passe */}
                            <div className="Login-champ">
                                <label className="Login-label" htmlFor="confirmMdp">Confirmer le mot de passe</label>
                                <input
                                    id="confirmMdp"
                                    type="password"
                                    placeholder="Confirmer le mot de passe"
                                    value={confirmMdp}
                                    onChange={(e) => setConfirmMdp(e.target.value)}
                                    className="Login-input"
                                    required
                                />
                            </div>
                        </div>
                    )}


                    {/* Bouton : Se connecter */}
                    <button type="submit" className="Login-bouton">
                        {doitChangerMdp ? "Changer le mot de passe" : "Se connecter"}
                    </button>

                    {/* Message d'erreur */}
                    {messageErreur && <p className="Login-erreur">{messageErreur}</p>}
                </form>
            </div>
        </div>
    );
}
