import React from 'react'
import './../Administrateur/PanelPlaylistMusiqueA.css' 
import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { faMusic, faPenSquare, faPlus, faFilter, faGear } from '@fortawesome/free-solid-svg-icons';
import { Home, Music } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function PanelPlaylistMusiqueU() {   // Les musiques contenues dans une playlist

    const location = useLocation(); // Permet d'accéder à l'état de navigation
    const { nom } = location.state || {}; // Récupère le nom de la playlist depuis l'état de navigation

    const { idPlaylist } = useParams(); // useParams = Récupère l'ID de la playlist directement depuis l'URL du navigateur

    const [musiquePlaylists, setMusiquePlaylists] = useState([]); // Stocke les musiques de la playlist
    const [messageErreur, setMessageErreur] = useState(""); // Pour afficher les erreurs générales ou accès refusé
    const [messageSuccess, setMessageSuccess] = useState(""); // Message succès après suppression



    const API_URL_FETCH = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("token"); // On récupère le token depuis le sessionStorage -> pour les requêtes authentifiées
    // Variable Commune pour tous les appels fetch

    useEffect(() => {
        getMusiquesInPlaylist(idPlaylist); // Je passe l'ID de la playlist à ma fonction de récupération des musiques
    }, [idPlaylist]); // Recharger les données si l'ID de la playlist change




    // -------------------------------------------------------- //
    // ------ FONCTION -> récup musiques d'une playlist ------- //
    // -------------------------------------------------------- //
    const getMusiquesInPlaylist = async (idDeMaPlaylist) => { // idDeMaPlaylist = même valeur que idPlaylist que j'ai récup plus tôt
        try {
            const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/Musique_Playlist.php?idPlaylist=${idDeMaPlaylist}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            // Si le serveru répond correctement
            if (res.ok) {
                const musiquesData = await res.json();
                setMusiquePlaylists(musiquesData);


                // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (ex: 404, 500...)
            } else {
                setMessageErreur(`Erreur HTTP : ${res.status}`);
                setMusiquePlaylists([]); // Vide le state
            }


            // Erreur -> Aucune réponse du serveur : problème réseau, timeout...etc
        } catch (error) {
            console.error("Erreur async :", error);
            setMessageErreur("Erreur lors du chargement des données.");
        }
    };
    // ---------------------------------------- //
    // ----------- FIN FONCTION GET ----------- //
    // ---------------------------------------- //




    /* ----------------------------------------- */
    /* --- FONCTION DELETE MUSIQUE PLAYLISTS --- */
    /* ----------------------------------------- */
    const deleteMusiqueInPlaylist = async (idMusique, idPlaylist) => {

        // Vérification avant suppression
        if (!window.confirm("Voulez-vous vraiment supprimer cette musique de la playlist ?")) {
            return;
        }

        try {
            const res = await fetch(
                `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/MusiquePlaylistActions.php?idPlaylist=${idPlaylist}&idMusique=${idMusique}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            // Si le serveur a répondu correctement 
            if (res.ok) {
                const data = await res.json();

                // Vérifier si la suppression a réussi
                if (data.success) {

                    // Supprimer la musique du state pour mise à jour immédiate de l'affichage
                    setMusiquePlaylists(prev =>

                        // Recréation d'un tableau avec toutes les musiques sauf celle qui a été supprimée -> filter (je garde une musique si au moins une des deux conditions est fausse)
                        prev.filter(m => {
                            if (Number(m.idMusique) !== Number(idMusique) || Number(m.idPlaylist) !== Number(idPlaylist)) {
                                return true;  // Si ID différent -> On garde la musique
                            }
                            return false;  // Si ID matche -> On la supprime
                        })
                    );


                    // Afficher message de succès 
                    setMessageSuccess("Musique supprimée de la playlist avec succès !");
                    setTimeout(() => setMessageSuccess(""), 3000);


                    // Erreur -> Le serveur a répondu OK mais l'API dit que la modif a échoué
                } else {
                    setMessageErreur(data.message || "Erreur lors de la suppression !");
                }

                // Erreur -> Le serveur a répondu avec une erreur HTTP (ex: 404, 500...)
            } else {
                setMessageErreur(`Erreur HTTP : ${res.status}`);
            }

            // Erreur -> Aucune réponse du serveur : problème réseau, timeout... etc
        } catch (err) {
            console.error("Erreur delete :", err);
            setMessageErreur("Erreur réseau !");
        }
    };
    /* ----------------------------------------------- */
    /* --------- FIN DELETE MUSIQUE PLAYLISTS -------- */
    /* ----------------------------------------------- */




    // Affichage écran 
    return (
        <div className="PPMA-panel-musique-playlist">

            {/* Bande titre */}
            <div className="PPMA-titre-panel">
                <div className="PPMA-title-content">
                    <div className="PPMA-title-icon">
                        <Music size={26} strokeWidth={2.2} />
                    </div>
                    <h1 className="PPMA-titre">
                        Musiques de <span className="PPMA-titre-playlist">{nom || "la playlist"}</span>
                    </h1>
                </div>
            </div>

            {/* Messages */}
            {messageErreur && <p className="PPMA-message-erreur">{messageErreur}</p>}
            {messageSuccess && <p className="PPMA-message-succes">{messageSuccess}</p>}


            {/* Liste des musiques */}
            <div className="PPMA-conteneur-tableau">
                <table className="PPMA-table-musique">
                    <thead>
                        <tr>
                            <th>Musique</th>
                            <th className="PPMA-col-actions">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* On vérifie que la playlist contient des musiques */}
                        {musiquePlaylists && musiquePlaylists.length > 0 ? (

                            // Parcourt des musiques
                            musiquePlaylists.map((musique) => (
                                <tr key={musique.idMusique}>

                                    {/* Affichage du titre de la musique (ou "—" si pas de titre) */}
                                    <td className="PPMA-col-nom">
                                        {musique.titre || "—"}
                                    </td>

                                    <td className="PPMA-col-actions">

                                        {/* Bouton de suppression */}
                                        <button
                                            className="PPMA-btn-supprimer"
                                            onClick={() =>
                                                deleteMusiqueInPlaylist(musique.idMusique, idPlaylist)
                                            }
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="PPMA-vide">
                                    Aucune musique dans cette playlist
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );

}