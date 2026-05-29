import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faGear, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Music } from 'lucide-react';
import "./../Administrateur/PanelPlaylistA.css";
import { Search } from "lucide-react";


export default function PanelMusiqueU() {

    // Ici on place les useState
    const [musiques, setMusiques] = useState([]); // Liste de toutes les musiques 
    const [messageErreur, setMessageErreur] = useState(""); // Messages d'erreur globaux (ex: erreur chargement données, erreur réseau...)
    const [genres, setGenres] = useState([]); // Liste déroulante des genres dans la modification d'une musique 

    // Messages erreur spécifiques aux popups
    const [messagePopupMusique, setMessagePopupMusique] = useState("");
    const [messagePopupPlaylist, setMessagePopupPlaylist] = useState("");
    const [messagePopupGenre, setMessagePopupGenre] = useState("");

    //Message validation (affiché en haut du tableau après une modif, suppression ou ajout réussi)
    const [messageSuccess, setMessageSuccess] = useState("");

    // Musique sélectionnée pour modification -> PUT / UPDATE (contient la musique qu'on est en train de modifier)
    const [musiqueEdit, setMusiqueEdit] = useState(null);

    // Ajouter une nouvelle musique au tableau
    const [musiqueAdd, setMusiqueAdd] = useState(null);

    // STATES LIES AUX FILTRES
    const [search, setSearch] = useState(""); // Filtrer par la barre de recherche (titre, artiste, album)
    const [genreFilter, setGenreFilter] = useState(""); // Filtrer par genre

    // STATES LIES AU TRI 
    const [triPar, setTriPar] = useState(""); // Tri par : titre / artiste / album / dateSortie / genre 
    const [ordre, setOrdre] = useState("");   // Valeur du tri : ASC / DESC

    // STATES LIES A LA POPUP "AJOUTER À UNE PLAYLIST" :
    const [playlists, setPlaylists] = useState([]); // La liste de toutes les playlists disponibles
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false); // Est ce que la popup d'ajout à une playlist est ouverte ou pas ? 
    const [selectedPlaylists, setSelectedPlaylists] = useState([]); // Les playlists cochées par l'utilisateur
    const [musiqueSelectionnee, setMusiqueSelectionnee] = useState(null); // La musique sur laquelle on a cliqué pour ouvrir le popup d'ajout à une playlist

    //STATES LIES A LA GESTION DES GENRES
    const [showGenresPopup, setShowGenresPopup] = useState(false); // Est ce que la popup de gestion des genres est ouverte ou pas ?
    const [nouveauGenre, setNouveauGenre] = useState(""); // Le nouveau genre à ajouter

    // URL de l'API
    const API_URL_FETCH = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("token"); // On récupère le token depuis le sessionStorage -> pour les requêtes authentifiées

    /* sessionStorage -> stockage temporaire du token qui ne dure que quand tu es sur le site 
        Si on ferme le site, alors le token est supprimé 

        localStorage lui -> garde le token même après fermeture pendant un temps défini 
    */


    // UseEffect qui permet d'interdire le scroll de la page d'arrière plan quand une popup s'affiche
    useEffect(() => {
        const unePopupEstOuverte = musiqueEdit || musiqueAdd || showPlaylistPopup || showGenresPopup; // Si au moins une des popups est ouverte (true ou false dans la variable)
        document.body.style.overflow = unePopupEstOuverte ? "hidden" : "auto";  // Si une popup est ouverte désactive le scroll sur la page (met en hidden), sinon scroll auto
        return () => { document.body.style.overflow = "auto"; }; // Clear -> Quand le composant est détruit -> on repasse en auto
    }, [musiqueEdit, musiqueAdd, showPlaylistPopup, showGenresPopup]); // UseEffect se relance à chaque fois qu'un de ces 4 states change (true ou false)


    /* Overflow -> propriété CSS qui dit quoi faire quand le contenu du body dépasse de l'écran (affiche une scrollbar automatiquement)
        Si on met en overflow:hidden -> alors le contenu qui dépasse l'écran est caché et donc plus rien à scroller
        C'est comme ça que le useEffect ci-dessus fonctionne */




    //HOOK useEffect
    useEffect(() => {

        //Appel de getMusiques() au moment où le composant apparaît à l'écran pour la première fois
        getMusiques();

    }, []); // Tableau vide [] -> je fais ça une seule fois au montage du composant



    // ---------------------------------------- //
    // -------- FONCTION GET DES MUSIQUES ----- //
    // ---------------------------------------- //

    // Va chercher les données depuis mon API PHP et les stocke dans le state musiques
    const getMusiques = async () => { // async -> permet d'utiliser await, et attendre la réponse du serveur avant de continuer l'exécution du code
        try {
            // Fetch -> permet d'envoyer une requête HTTP vers une URL (ici mon API PHP) et renvoie une promesse qui se résout en une réponse du serveur
            const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Musique.php`,
                {
                    method: "GET", // Je demande à lire les données
                    headers: {
                        "Authorization": `Bearer ${token}` // On envoie le token pour les requêtes authentifiées -> vérifie que token est valide avant de renvoyer les données
                    }
                }
            );
            if (res.ok) { // Vérifie que le serveur a répondu avec un code de succès (200 - 299)
                const musiquesData = await res.json() // Lit le JSON renvoyé et transforme la réponse brute en objet JavaScript
                setMusiques(musiquesData) // Stocke les musiques dans le state pour les afficher

            } else {

                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
                setMessageErreur(`Erreur ${res.status}`) // Affiche le code d'erreur reçu 
            }

            // Erreurs techniques -> communication n'a même pas eu lieu
        } catch (error) {
            console.error("Erreur async :", error); // Erreur console 
            setMessageErreur("Erreur lors du chargement des données."); // Erreur par défaut affichée dans l'interface pour prévenir l'utilisateur
        }
    };

    // ---------------------------------------- //
    // -------- FIN FONCTION GET MUSIQUES ----- //
    // ---------------------------------------- //




    // ---------------------------------------- //
    // --------- FONCTION GET GENRES ---------- //
    // ---------------------------------------- //
    const getGenres = async () => {
        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Genre.php`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (res.ok) { // Vérifie que le serveur a répondu avec un code de succès
                const genresData = await res.json(); // Lit le JSON renvoyé et le transforme en objet JavaScript
                setGenres(genresData); // Stocke les genres dans le state pour les afficher
            } else {

                // Erreur -> Le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
                setMessageErreur(`Erreur ${res.status}`); // Affiche le code d'erreur reçu 
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (err) {
            console.error("Erreur fetch genres :", err);
            setMessageErreur("Erreur lors du chargement des données.");
        }
    };
    // ---------------------------------------- //
    // ------ FIN FONCTION GET GENRES  -------- //
    // ---------------------------------------- //


    // Appel de la fonction getGenres au chargement du composant (pour filtrer par genre, popup de modification musique, et gestion genre)
    useEffect(() => {
        getGenres();
    }, []);




    // --------------------------------------- //
    // --------- FILTRAGE ET TRI ------------- //
    // --------------------------------------- //
    let musiquesAffichees = [...musiques]; /* Copie données dans nouvelle variable pour pouvoir les filtrer / trier sans toucher au state
                                                original de musiques (pour ne pas perdre les données originales) */

    // On vérifie que ce qu'il y a dans la barre de recherche (state search) n'est pas vide (si utilisateur a tapé ou pas un filtre de recherche)
    if (search) {
        const recherche = search.toLowerCase(); // On met la recherche de l'user dans "recherche" (et minuscule pour casse)

        // Parcours du tableau de musiquesAffichees pour ne garder que celles qui correspondent à la recherche 
        // Est ce que le titre OU l’artiste OU l’album de CETTE musique, correspond avec ce qu'a tapé l’utilisateur ?  
        musiquesAffichees = musiquesAffichees.filter((m) =>
            m.titre.toLowerCase().includes(recherche) || // includes -> vérifie qu'une chaine contient une autre chaine 
            m.artiste.toLowerCase().includes(recherche) ||
            m.album.toLowerCase().includes(recherche)
        );
    } // True / False -> implicites 


    // Filtre -> liste déroulante pour les genres 

    // Si le state du genre contient bien un filtre sélectionné
    if (genreFilter) {

        // Même principe -> Nouveau tab de musiques avec QUE les valeurs correspondant à la conditon (au genre selec par l'user)
        musiquesAffichees = musiquesAffichees.filter((m) => {

            // Compare libelle musique avec celui entré par user
            if (m.libelleGenre === genreFilter) {
                return true; // Musique incluse
            } else {
                return false; // Musique ejectée
            }
        });
    }


    // TRI

    // Si tripar contient un tri selectionné 
    if (triPar) {

        // .sort -> Modifie le tableau existant en direct (pas de création de new tab comme filter)
        musiquesAffichees.sort((a, b) => {

            // 2 valeurs d'une musique (titre, album, artiste...etc) pour savoir laquelle va avant l'autre (ou après selon ordre ASC ou DESC)
            let valA = a[triPar];
            let valB = b[triPar];


            // Convertir les tris dates en objets Date pour pouvoir les comparer correctement 
            // Permet d'éviter que JS compare caractère par caractère, mais que ça prenne la date complète -> protection pour éviter des erreurs (format anglais marcherait, mais pas français)
            if (triPar === "dateSortie") {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            // Comparaisons des 2 valeurs pour savoir laquelle est plus grande que l'autre 

            // Si A plus petit que B 
            if (valA < valB) {

                // SI ordre = ASC 
                if (ordre === "ASC") {

                    // Je veux le plus petit avant le plus grand 
                    return -1; // sort attend un chiffre positif ou négatif pour décider de l'ordre (négatif = avant, positif = après)

                    // Si DESC
                } else {
                    // Je veux le plus grand avant le plus petit
                    return 1;
                }
            }

            // Si A plus grand que B
            if (valA > valB) {
                // Si ordre = ASC 
                if (ordre === "ASC") {

                    // Je veux le plus petit avant le plus grand
                    return 1;

                    // Si DESC
                } else {
                    // Je veux le plus grand avant le plus petit
                    return -1;
                }
            }

            return 0; // Si ils sont égaux 
        });
    }
    // --------------------------------------- //
    // -------- FIN FILTRAGE ET TRI  --------- //
    // --------------------------------------- //






    // --------------------------------------------------------- //
    // -------- FONCTION -> ADD MUSIQUE DANS PLAYLIST  --------- //
    // --------------------------------------------------------- //
    const addMusiqueInPlaylist = async (idMusique, selectedPlaylists) => {

        setMessagePopupPlaylist(""); // Réinitialiser message à chaque fois qu'on ouvre la popup d'ajout à une playlist
        setMessageSuccess(""); // Réinitialiser message succès pour éviter qu'il reste affiché 


        /* Vérification */

        // Si ID musique est vide ou si aucune playlist n'est sélectionnée 
        if (!idMusique || selectedPlaylists.length === 0) {
            return { success: false, message: "Veuillez sélectionner au moins une playlist !" };
        }

        /* Fin vérification*/



        try {

            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/MusiquePlaylistActions.php`,
                {
                    method: "POST",
                    headers:
                    {
                        "Content-Type": "application/json", // Préviens que j'envoie du JSON
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ idMusique, playlists: selectedPlaylists }), // Convertit objet JS en JSON 
                    // playlists: selectedPlaylists -> Clé / Valeur (Ex : musique.titre) et dans un objet on séparé clé / valeur avec :
                }                                   // Parmis ce tableau de playlists, voici celles qui ont été selectionnées 
            );

            // Si le serveur a répondu avec un code succès (200-299)    
            if (res.ok) {
                const data = await res.json();

                // Si l'API a pu ajouter la musique dans la/les playlist/s en BDD
                if (data.success) {
                    return { success: true };

                    // Erreur -> Le serveur a répondu OK mais l'API dit que l'ajout dans la playlist a échoué
                } else {

                    // On récupère le tableau d'erreurs du backend, ou un message par défaut
                    const messageErreur = data.errors?.join(", ") || data.message || "Erreur lors de l'ajout";
                    // Si erreur parmis tab -> on l'affiche en regroupant la liste des erreurs en une seule string 
                    // Sinon message erreur simple que le back peut renvoyer 
                    // Sinon pas d'erreur ou undefined -> message par défaut

                    return { success: false, message: messageErreur };
                }

                // Erreur -> Le serveur a répondu avec une erreur HTTP (ex: 404, 500...)
            } else {
                return { success: false, message: "Erreur serveur !" };
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (error) {
            console.error("Erreur réseau :", error);
            return { success: false, message: "Erreur réseau !" };
        }
    };
    // --------------------------------------------------------- //
    // -------- FIN FONCTION -> MUSIQUE DANS PLAYLIST  --------- //
    // --------------------------------------------------------- //








    // --------------------------------------------------------------------------------------- //
    // -------- FONCTION -> GET PLAYLISTS (POUR LE POPUP QUAND J'APPUIE SUR PLAYLIST) --------- //
    // --------------------------------------------------------------------------------------- //
    const getPlaylists = async () => {
        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Playlist.php`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            // Si le serveur a répondu avec un code succès (200-299)
            if (res.ok) {
                const data = await res.json();
                setPlaylists(data);

                // Si l'API a répondu mais que les données ne sont pas au bon format ou vides
            } else {
                setPlaylists([]); // On met un tableau vide pour éviter d'avoir des erreurs d'affichage dans le popup 

            }

        } catch (error) {
            console.error("Erreur récupération playlists :", error);
            setPlaylists([]);
        }
    };
    // -------------------------------------------------- //
    // -------- FIN FONCTION -> GET PLAYLISTS --------- //
    // -------------------------------------------------- ///







    /* --------------------------------------- */
    /* ----------- AFFICHAGE ECRAN ----------- */
    /* --------------------------------------- */
    return (
        <div className="PMA-panel-musiques-admin">

            {/* TITRE BANDE ROSE + ICONE */}
            <div className="PMA-panel-title">
                <div className="PMA-title-content">
                    <div className="PMA-title-icon">
                        <Music size={26} strokeWidth={2.2} />
                    </div>
                    <h1>Bibliothèque musicale</h1>
                </div>
            </div>

            <div className="PMA-panel-header">


                {/* Filtrer par artiste, album, titre */}
                <div className="PMA-conteneur-searchbar">
                    <div className="PMA-search-bar">
                        <input
                            type="text"
                            placeholder="Rechercher par titre, artiste ou album..."
                            value={search} // Affichage du texte contenu dans la searchbar (se met à jour à chaque frappe grâce à onChange et setSearch)
                            onChange={(e) => setSearch(e.target.value)} // e = objet évènement créé automatiquement par le navigateur à chaque frappe
                        // onChange -> Ecouteur d'évènement, à chaque fois que l'input change
                        // target = élément sur lequel se produit l'évènement (la searchbar)
                        // value = Le texte contenu dans l'input à cet instant 
                        />
                        <Search /> {/* SVG lucide react */}
                    </div>
                </div>


                {/* BOUTONS EN DESSOUS */}
                <div className="PMA-buttons-actions">

                
                    {/* FILTRES ET TRI */}
                    <div className="PMA-select-wrapper">
                        <FontAwesomeIcon icon={faFilter} className="PMA-select-icon-left" />

                        <select
                            className="PMA-filtre-tri"
                            value={`${triPar}-${ordre}`} // Va afficher dans la liste déroulante le tri sélectionné (ex: titre-ASC)

                            // Evenement de changement du state de tri quand on sélectionne un tri dans la liste déroulante
                            onChange={(e) => {
                                if (!e.target.value) return; // Si l'user sélectionne "Trier par" (option vide) -> enlève le tri,    remet affichage par défaut 
                                const [col, ord] = e.target.value.split("-");
                                // split("-") : coupe une chaîne de caractères là où il y a un - et met les morceaux dans un tableau -> ["titre", "ASC"]

                                // Destructuration -> Extraire valeurs d'un tableau pour les mettre dans des variables 
                                setTriPar(col); // Modif des states par les valeurs recup
                                setOrdre(ord);
                            }}
                        >
                            <option value="">Trier par</option>
                            <option value="titre-ASC">Titre (A → Z)</option>
                            <option value="titre-DESC">Titre (Z → A)</option>
                            <option value="artiste-ASC">Artiste (A → Z)</option>
                            <option value="artiste-DESC">Artiste (Z → A)</option>
                            <option value="album-ASC">Album (A → Z)</option>
                            <option value="album-DESC">Album (Z → A)</option>
                            <option value="dateSortie-ASC">Date de sortie (ancien → récent)</option>
                            <option value="dateSortie-DESC">Date de sortie (récent → ancien)</option>
                        </select>
                    </div>



                    {/* Filtrer par genre */}
                    <div className="PMA-select-wrapper" style={{ position: "relative" }}>
                        <FontAwesomeIcon icon={faFilter} className="PMA-select-icon-left" />

                        <select
                            className="PMA-filtre-select"
                            value={genreFilter} // Affiche dans la liste déroulante le genre sélectionné pour le filtre
                            onChange={(e) => setGenreFilter(e.target.value)} // Je mets la nouvelle valeur du filtre qu'on va chercher quand y'a un changement détecté, dans le state genreFilter pour que ça mette à jour l'affichage des musiques filtrées
                        // Rappel : e.target.input Je vais chercher dans cet input, la valeur qu'il contient 
                        >
                            <option value="">Filtrer par genre</option>

                            {/* On parcourt le tableau de genres, pour chaque genre -> créer une <option> */}
                            {genres.map((g) => (

                                // On créer une option pour chaque genre et on affiche son libelle dedans (pour liste déroulante des filtres)
                                <option key={g.idGenre} value={g.libelle}>
                                    {g.libelle}
                                </option>

                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Messages d'erreur ou de succès*/}
            {messageSuccess && <p className="PMA-message-success">{messageSuccess}</p>}
            {messageErreur && <p className="PMA-message">{messageErreur}</p>}



            {/* GRID DES MUSIQUES */}
            <div className="PMA-musique-grid">

                {/* Si le tableau existe ET qu'il contient des éléments  */}
                {musiquesAffichees && musiquesAffichees.length > 0 ? (

                    // Alors on parcourt chaque musique de la copie du state musiques (qui contient les filtres / tris)
                    musiquesAffichees.map((musique) => (

                        // Pour chaque musique, on créer une carte à afficher (key = id pour aider react à identifier la musique)
                        <div key={musique.idMusique} className="PMA-musique-card">

                            {/* Afficher l'image de la musique */}
                            <div className="PMA-musique-img">

                                {/* Si l'image de la musique existe, on l'affiche */}
                                {musique.pochette ? (
                                    <img src={musique.pochette} alt={musique.titre} /> // Affichage de l'image 
                                ) : (
                                    <div className="PMA-musique-placeholder"></div> // Affichage d'une div vide si pas d'image (avec carré gris css)
                                )}
                            </div>


                            {/* Afficher les informations de la musique */}
                            <div className="PMA-musique-info">

                                <h3>{musique.titre}</h3>
                                <p className="PMA-musique-artiste">{musique.artiste}</p>
                                <p className="PMA-musique-album">{musique.album}</p>

                                <hr className="PMA-musique-separator" />

                                <div className="PMA-musique-bottom">
                                    <span className="PMA-musique-genre">{musique.libelleGenre}</span>
                                    <span className="PMA-musique-date">{musique.dateSortie}</span>
                                </div>
                            </div>


                            {/* Boutons d'action pour chaque musique */}
                            <div className="PMA-musique-actions">


                                {/* Bouton PLAYLIST -> Pour ajouter la musique à une playlist */}
                                <button
                                    onClick={() => {
                                        setMusiqueSelectionnee(musique);  // On met la musique sélectionnée dans un state pour la mémoriser le temps que l'user sélectionne une playlist
                                        getPlaylists(); // Récupère toutes les playlists -> les afficher dans la popup

                                        // Effacer les playlists cochées de la musique précédente (si on en ouvre une nouvelle)
                                        if (musique.playlists) {

                                            // Parcourt le tableau de musique et vérifie et choppe les id des playlists pour lesquelles la musique est déjà assignée dedans
                                            const ids = musique.playlists.map(p => p.idPlaylist);
                                            setSelectedPlaylists(ids); // On donne les id au state 
                                        } else {
                                            setSelectedPlaylists([]); // Si y'en a pas -> tableau vide
                                        }

                                        setMessagePopupPlaylist("");
                                        setShowPlaylistPopup(true);
                                    }}
                                >
                                    Playlist
                                </button>


                            </div>
                        </div>
                    ))
                ) : (
                    <p className="PMA-empty">Aucune musique disponible</p>
                )}
            </div>




            {
                /* --------------------------------------------- */
                /* ---- POPUP D'AJOUT MUSIQUE DANS PLAYLIST ---- */
                /* --------------------------------------------- */
            }
            {
                // Le && tout seul = if(showPlaylistPopup), vérifie si la condition n'est pas null 
                showPlaylistPopup && (
                    <>

                        {/* Si on clique sur l'arrière plan pendant qu'on est dans le popup -> fermeture */}
                        <div className="PMA-popup-edit-overlay" onClick={() => setShowPlaylistPopup(false)}></div>

                        <div className="PMA-popup-edit">
                            <h3>Ajouter à une playlist</h3>

                            {/* LISTE DES PLAYLISTS */}
                            <div className="PMA-playlist-list">

                                {/* Si au moins une playlist dans liste */}
                                {playlists.length > 0 ? (

                                    // Parcours du state des playlists
                                    playlists.map((playlist) => {

                                        // Savoir si l'id d'une playlist est sélectionnée : oui -> cochée, non -> pas cochée
                                        const isSelected = selectedPlaylists.includes(playlist.idPlaylist);

                                        return (
                                            // Si playlist cochée -> on lui ajoute la classe selected (explication de la ternaire)
                                            <div key={playlist.idPlaylist} className={`PMA-playlist-item ${isSelected ? "selected" : ""}`}

                                                // Lors du clic sur une playlist 
                                                onClick={() => {
                                                    const id = playlist.idPlaylist; // On récupère l'id de la playlist cliquée

                                                    // Modifie le state -> système de coche / décoche 
                                                    setSelectedPlaylists((prev) =>

                                                        // prev = ancien tableau de selectedPlaylists 
                                                        prev.includes(id)

                                                            // On vérifie si l'id de la playlist cliquée est déjà dans prev, si oui -> décoche (avec .filter)
                                                            ? prev.filter(p => p !== id) // Parcourt le tableau et garde seulement les éléments qui respectent la condition
                                                            : [...prev, id] // Si la playlist cliquée n'est pas dans le prev, -> coche -> alors on l'ajoute (avec le spread et le nouvel id)
                                                    );
                                                }}
                                            >

                                                {playlist.nom} {/* Affichage du nom de la playlist dans la popup*/}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Aucune playlist disponible</p>
                                )}
                            </div>


                            {/* Message d'erreur DANS la popup */}
                            {messagePopupPlaylist && <p className="PMA-popup-message">{messagePopupPlaylist}</p>}


                            {/* Boutons d'actions */}
                            <div className="PMA-popup-actions">


                                {/* Bouton "VALIDER" */}
                                <button

                                    className="PMA-btn-validate"

                                    // Async pour utiliser await
                                    onClick={async () => {
                                        setMessagePopupPlaylist(""); // Vide l'ancien message

                                        // On stocke la réponse de la fonction dans resultat (on lui donne l'id de la musique sur laquelle on a cliqué, et le tableau des id des playlists cochées)
                                        const resultat = await addMusiqueInPlaylist(musiqueSelectionnee.idMusique, selectedPlaylists);


                                        // Si la fonction a réussi à ajouter la musique dans les playlists en BDD
                                        if (resultat.success) {
                                            setShowPlaylistPopup(false);

                                            const nbPlaylists = selectedPlaylists.length; // Stocke le nb de playlists dans laquelle la musique a été add


                                            // Message de succès 
                                            setMessageSuccess(
                                                nbPlaylists === 1
                                                    ? "Musique ajoutée à la playlist avec succès !" // Si une seule playlist = un message au singulier
                                                    : "Musique ajoutée aux playlists avec succès !" // Si plusieurs -> pluriel
                                            );
                                            setTimeout(() => setMessageSuccess(""), 3000);


                                            // Erreur -> On affcihe le mess d'erreur que la fonction nous a renvoyé 
                                        } else {
                                            setMessagePopupPlaylist(resultat.message);
                                        }
                                    }}
                                >
                                    Valider
                                </button>


                                {/* Bouton ANNULER */}
                                <button
                                    className="PMA-btn-cancel"
                                    onClick={() => setShowPlaylistPopup(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </>
                )
            }

            {
                /* --------------------------------------------- */
                /* ---- FIN POPUP ADD MUSIQUE DANS PLAYLIST ---- */
                /* --------------------------------------------- */
            }


        </div >
    );

}

