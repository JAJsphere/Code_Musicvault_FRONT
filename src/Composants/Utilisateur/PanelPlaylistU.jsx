import React from 'react';
import "./../Administrateur/PanelPlaylistA.css";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { faPlus, faGear, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ListMusic } from "lucide-react";
import { Search } from "lucide-react";

export default function PanelPlaylistU() {

  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]); // state pour stocker les playlists
  const [messagePopup, setMessagePopup] = useState(""); //Messages erreur -> POPUP
  const [messageErreur, setMessageErreur] = useState(""); //Messages erreur -> ECRAN PRINCIPAL

  const [playlistEdit, setPlaylistEdit] = useState(null); // state pour stocker la playlist en cours d'édition

  const [messageSuccess, setMessageSuccess] = useState(""); //Message validation dès qu'une playlist modifiée/ajoutée/supprimée avec succès

  //Ajouter une nouvelle playlist au tableau
  const [playlistAdd, setPlaylistAdd] = useState(null);


  //Partie ADMIN POWERS -> playlists utilisateurs 
  const [playlistsUsersAdmin, setPlaylistsUsersAdmin] = useState([]); //Stocker les playlists de TOUS les users 
  const [popupAdminOpen, setPopupAdminOpen] = useState(false);


  // STATES LIES AUX FILTRES
  const [search, setSearch] = useState("");

  // STATES LIES AU TRI 
  const [triPar, setTriPar] = useState(""); // Tri par : titre / artiste / album / dateSortie / genre 
  const [ordre, setOrdre] = useState("");   // Valeur du tri : ASC / DESC

  const API_URL_FETCH = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token"); // On récupère le token depuis le sessionStorage -> pour les requêtes authentifiées
  // Variable Commune pour tous les appels fetch 


  // UseEffect qui permet d'interdire le scroll de la page d'arrière plan quand une popup s'affiche
  useEffect(() => {
    const unePopupEstOuverte = playlistEdit || playlistAdd || popupAdminOpen;
    document.body.style.overflow = unePopupEstOuverte ? "hidden" : "auto";  // Si une popup est ouverte désactive le scroll sur la page (met en hidden), sinon scroll auto
    return () => { document.body.style.overflow = "auto"; }; // Clear -> Quand le composant est détruit -> on repasse en auto
  }, [playlistEdit, playlistAdd, popupAdminOpen]); // UseEffect se relance à chaque fois qu'un de ces 3 states change (true ou false)




  //HOOK useEffect
  useEffect(() => {

    getPlaylists();

  }, []); // Une seule fois au montage du composant





  // --------------------------- //
  // - FONCTION GET PLAYLISTS -- //
  // --------------------------- //
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

      if (res.ok) { // Vérifie que le serveur a répondu avec un code de succès (200 - 299)

        const playlistsData = await res.json(); // Lit le JSON renvoyé et le transforme en objet JavaScript
        setPlaylists(playlistsData); // Stocke les playlists dans le state pour les afficher


      } else {

        // Erreur serveur -> le serveur a répondu mais avec un code d'erreur (404, 500...)
        setMessageErreur(`Erreur ${res.status}`); // Affiche le code d'erreur reçu

      }

    } catch (error) {

      // Erreurs techniques -> la communication avec le serveur n'a pas pu être effectuée
      console.error("Erreur async :", error); // Affiche l'erreur dans la console
      setMessageErreur("Erreur lors du chargement des données."); // Message d'erreur générique affiché à l'utilisateur

    }
  };
  // -------------------------------------------- //
  // -------- FIN FONCTION GET PLAYLISTS -------- //
  // -------------------------------------------- //





  /* ---------------------------------------- */
  /* ------- FONCTION UPDATE PLAYLIST ------- */
  /* ---------------------------------------- */
  const updatePlaylist = (playlist) => {

    setPlaylistEdit({ ...playlist }); // Clone la playlist reçue en paramètre
    setMessagePopup("");
  };

  // Dès qu'on appuie sur "Valider" après avoir modifié la playlist
  const handleUpdate = async () => {

    /* ------------ VERIFICATIONS ------------ */
    if (!playlistEdit.nom.trim()) {
      setMessagePopup("Veuillez remplir le nom de la playlist !");
      return;
    }
    /* ---------- FIN VERIFICATIONS ---------- */


    try {
      const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/PlaylistActions.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(playlistEdit),
      });

      // Si le serveur a répondu
      if (res.ok) {
        const data = await res.json();


        // Si l'API a modifié la playlist avec succès en BDD 
        if (data.success) {

          // MAJ playlists côté admin 
          if (playlistsUsersAdmin.length > 0) {
            setPlaylistsUsersAdmin(prev => // State qui contient toutes les playlists de tous les utilisateurs de l'application (modifie le state destiné à l'admin)
              prev.map(p => { // Prev = version EXACTE du state au moment où je vais appliquer la mise à jour 

                // Est-ce que c'est CETTE playlist que je modifie
                if (p.idPlaylist === playlistEdit.idPlaylist) {
                  return { ...playlistEdit }; // Oui -> Le spread copie les nouvelles données de LA PLAYLIST passée en paramètre dans le nouveau tableau du .map -> donc comme si setPlaylists(nouveauTableau)
                }
                return p; // Sinon garde playlist telle quelle
              })
            );
          }


          // MAJ playlists côté affichage principal
          setPlaylists(prev => {
            return prev.map(p => {

              // Si c'est la playlist qu'on modifie
              if (p.idPlaylist === playlistEdit.idPlaylist) {
                return { ...playlistEdit };
              }

              return p;
            });
          });

          setPlaylistEdit(null); // Ferme le popup

          // Message de succès
          setMessageSuccess("Playlist modifiée avec succès !");
          setTimeout(() => setMessageSuccess(""), 3000);


          // Erreur -> Le serveur a répondu OK mais l'API dit que la modif a échoué
        } else {
          setMessagePopup("Erreur lors de la modification !");
        }

        // Erreur -> Le serveur a répondu avec une erreur HTTP (ex: 404, 500...)
      } else {
        setMessagePopup("Erreur lors de la modification !");
      }

      // Erreur -> Aucune réponse du serveur : problème réseau, timeout... etc
    } catch (err) {
      console.error("Erreur update :", err);
      setMessagePopup("Erreur réseau !");
    }
  };
  /* --------------------------------------- */
  /* --------- FIN FONCTION UPDATE --------- */
  /* --------------------------------------- */






  /* --------------------------------------- */
  /* ------ FONCTION CREATE PLAYLIST ------- */
  /* --------------------------------------- */
  const createPlaylist = async () => {

    /* ------------ VERIFICATIONS ------------ */
    if (!playlistAdd.nom.trim()) {
      setMessagePopup("Veuillez remplir le nom de la playlist !");
      return;
    }
    /* ---------- FIN VERIFICATIONS ---------- */


    try {
      const res = await fetch(`${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/PlaylistActions.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Je précise que j'envoie du JSON
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(playlistAdd), // Je transforme l'objet playlistAdd en JSON pour l'envoyer au serveur
      });

      // Si le serveur a répondu
      if (res.ok) {
        const data = await res.json();


        // Vérification si l'ajout a réussi
        if (data.success) {
          setPlaylists([...playlists, data.playlist]); // Ajouter la playlist créée par l'API à la liste des playlists affichées (+ les playlists déjà présentes)
          setPlaylistAdd(null);


          //Afficher le message de succès
          setMessageSuccess("Playlist ajoutée avec succès !");
          setTimeout(() => setMessageSuccess(""), 3000);


          // Erreur -> Le serveur a répondu OK mais l'API dit que l'ajout a échoué
        } else {
          setMessagePopup("Erreur lors de l'ajout !");
        }

        // Erreur -> Le serveur a répondu avec une erreur HTTP (ex: 404, 500...)
      } else {
        setMessagePopup(`Erreur ${res.status} : impossible de créer la playlist`);
      }

      // Erreur -> Aucune réponse du serveur : problème réseau, timeout... etc
    } catch (err) {
      console.error("Erreur create :", err);
      setMessagePopup("Erreur réseau !");
    }
  };
  /* --------------------------------------- */
  /* --------- FIN CREATE PLAYLIST --------- */
  /* --------------------------------------- */






  /* --------------------------------------- */
  /* ------ FONCTION DELETE PLAYLISTS ------ */
  /* --------------------------------------- */
  const deletePlaylist = async (idPlaylist) => {

    // Refus de suppression -> arrêt de la fonction
    if (!window.confirm("Voulez-vous vraiment supprimer cette playlist ?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL_FETCH}/AP_PILLA/PHP_API_BACK/API/PlaylistActions.php?idPlaylist=${idPlaylist}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        }
      );

      // Si le serveur a bien répondu
      if (res.ok) {
        const data = await res.json();


        // Si l'API a supprimé la playlist avec succès en BDD
        if (data.success) {

          // Je garde toutes les playlists dont l'ID est différent de celle que je veux supprimer -> donc je supprime la playlist de l'affichage
          setPlaylists(prev => prev.filter(function (p) {

            // Filter se demande : "Est ce que je garde cet élément dans le résultat final ?"

            // Est ce que cette playlist est celle que je veux supprimer 
            if (p.idPlaylist == idPlaylist) {

              return false; // C'est la playlist que je veux supprimer -> Je ne la garde pas dans le nouveau tableau  (False = Enlever)
            } else {
              return true;  // Ce n'est pas la playlist que je veux supprimer -> Je la garde dans le nouveau tableau (True = Garder)
            }

          }));

          // Message de succès
          setMessageSuccess("Playlist supprimée avec succès !");
          setTimeout(() => setMessageSuccess(""), 3000);

          // Erreur -> Le serveur a répondu OK mais l'API dit que la suppression a échoué
        } else {
          setMessagePopup("Erreur lors de la suppression !");
        }

        // Erreur -> Le serveur a répondu avec une erreur HTTP (ex: 404, 500...)
      } else {
        setMessagePopup(`Erreur ${res.status} : suppression impossible`);
      }

      // Erreur -> Aucune réponse du serveur : problème réseau, timeout... etc
    } catch (err) {
      console.error("Erreur delete :", err);
      setMessagePopup("Erreur réseau !");
    }
  };
  /* --------------------------------------- */
  /* --------- FIN DELETE PLAYLISTS -------- */
  /* --------------------------------------- */





  // --------------------------------------- //
  // ----- FILTRAGE ET TRI COTE CLIENT ----- //
  // --------------------------------------- //
  let playlistsAffichees = [...playlists];

  if (search) {
    const recherche = search.toLowerCase();

    playlistsAffichees = playlistsAffichees.filter((p) =>

      // Je garde uniquement les playlists où le nom contient le nom de la recherche (créer nouveau tableau avec valeurs correspondant à condition)
      p.nom.toLowerCase().includes(recherche)

    );
  }


  // TRI
  if (triPar === "nom") {

    playlistsAffichees.sort((a, b) => {

      const valA = (a.nom || "").toLowerCase();
      const valB = (b.nom || "").toLowerCase();

      if (valA < valB) return ordre === "ASC" ? -1 : 1;
      if (valA > valB) return ordre === "ASC" ? 1 : -1;
      return 0;

    });
  }
  // --------------------------------------- //
  // -------- FIN FILTRAGE ET TRI  --------- //
  // --------------------------------------- //










  /* --------------------------------------- */
  /* ----------- AFFICHAGE ECRAN ----------- */
  /* --------------------------------------- */
  return (
    <div className="PPA-panel-playlist-admin">

      {/* TITRE BANDE ROSE + ICONE */}
      <div className="PPA-panel-title">
        <div className="PPA-title-content">
          <div className="PPA-title-icon">
            <ListMusic size={26} strokeWidth={2.2} />
          </div>
          <h1>Vos playlists</h1>
        </div>
      </div>


      {/* Filtrer par artiste, album, titre */}
      <div className="PPA-conteneur-searchbar">
        <div className="PPA-search-bar">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search} // Valeur affichée dans l'input = ce que contient search 
            onChange={(e) => setSearch(e.target.value)} // Onchange -> se déclenche quand la valeur de l'input change, puis met à jour le state search par la valeur de l'input actuel
          />
          <Search />
        </div>
      </div>


      {/* HEADER AVEC BOUTONS */}
      <div className="PPA-panel-header">
        <div className="PPA-buttons-actions">
          <div className="PPA-content-wrapper">
            <div className="PPA-buttons-wrapper">

              {/* Ajouter une playlist */}
              <button
                className="PPA-btn-action-create"
                onClick={() => {
                  setMessagePopup("");
                  setPlaylistAdd({ nom: "", imageCouv: "" }); // Champs prochaine playlist à 0
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                Ajouter une playlist
              </button>



              {/* TRI */}
              <div className="PPA-select-wrapper">
                <FontAwesomeIcon icon={faFilter} className="PMA-select-icon-left" />

                <select
                  className="PPA-filtre-tri"
                  value={`${triPar}-${ordre}`}

                  onChange={(e) => { // Change quand choisit une option de tri différente 
                    if (!e.target.value) // Si select vide -> arrêt 
                      return;

                    const [col, ord] = e.target.value.split("-"); // Transformer la valeur "nom-ASC" en tableau ["nom", "ASC"] -> col = "nom", ord = "ASC"
                    setTriPar(col);
                    setOrdre(ord);
                  }}
                >
                  <option value="">Trier par</option>
                  <option value="nom-ASC">Nom (A → Z)</option>
                  <option value="nom-DESC">Nom (Z → A)</option>
                </select>
              </div>


            </div>
          </div>
        </div>

        {/* Message succès / erreur */}
        {messageSuccess && <p className="PPA-message-success">{messageSuccess}</p>}
        {messageErreur && <p className="PPA-message">{messageErreur}</p>}


        {/* GRID DES PLAYLISTS */}
        <div className="PPA-playlist-card-conteneur">
          <div className="PPA-playlist-grid">

            {/* Vérifie si il y a des playlists à afficher */}
            {playlistsAffichees && playlistsAffichees.length > 0 ? (

              // Parcourt playlists -> affiche une carte par playlist
              playlistsAffichees.map((playlist) => (

                <div key={playlist.idPlaylist} className="PPA-playlist-card">
                  <div className="PPA-playlist-img">

                    {/* Image de couverture */}
                    {playlist.imageCouv ? (
                      <img src={playlist.imageCouv} alt={playlist.nom} />
                    ) : (
                      <div className="PPA-playlist-placeholder"></div>
                    )}
                  </div>

                  <div className="PPA-playlist-info">
                    <h3>{playlist.nom}</h3>
                  </div>

                  {/* Les boutons de la carte d'une playlist*/}
                  <div className="PPA-playlist-actions">
                    <button onClick={() => updatePlaylist(playlist)}>Modifier</button>

                    <button
                      onClick={() =>
                        navigate(`/Uplaylist/${playlist.idPlaylist}`, { state: { nom: playlist.nom } }) // State -> Permet de transmettre des données à la page de destination sans les mettre dans l'URL. 
                        // Ici on transmet le nom de la playlist 
                      }
                    > 
                      Voir
                    </button>

                    <button onClick={() => deletePlaylist(playlist.idPlaylist)}>Supprimer</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="PPA-empty">Aucune playlist disponible</p>
            )}
          </div>
        </div>
      </div>


      {/* POPUP EDIT PLAYLIST */}

      {/*Le && tout seul = if(playlistEdit), vérifie si la condition n'est pas null */}
      {playlistEdit && (
        <>

          {/* Si on clique sur l'arrière plan pendant qu'on est dans la popup -> fermeture */}
          <div className="PPA-popup-edit-overlay" onClick={() => setPlaylistEdit(null)}></div>
          <div className="PPA-popup-edit">
            <h3>Modifier la playlist</h3>

            <label>
              Nom :
              <input
                type="text"
                value={playlistEdit.nom}
                placeholder="Nouveau nom"
                onChange={(e) => setPlaylistEdit({ ...playlistEdit, nom: e.target.value })} // Copie tout le state playlistEdit mais remplace uniquement la valeur du nom par la nouvelle valeur rentrée dans l'input
              />
            </label>

            <label>
              Image de couverture (URL) :
              <input
                type="text"
                value={playlistEdit.imageCouv || ""}
                placeholder="Nouvelle URL"
                onChange={(e) => setPlaylistEdit({ ...playlistEdit, imageCouv: e.target.value })}
              />
            </label>

            {/* Si message erreur -> affichage du message dans la popup */}
            {messagePopup && <p className="PPA-popup-message">{messagePopup}</p>}

            <div className="PPA-popup-actions">
              <button className="PPA-btn-validate" onClick={handleUpdate}>Valider</button>
              <button className="PPA-btn-cancel" onClick={() => setPlaylistEdit(null)}>Annuler</button> {/*setPlaylistEdit(null) -> je ne suis plus en train d'éditer */}
            </div>
          </div>
        </>
      )}


      {/* POPUP AJOUT PLAYLIST */}
      {playlistAdd && (
        <>

          {/* Si on clique sur l'arrière plan pendant qu'on est dans la popup -> fermeture */}
          <div className="PPA-popup-edit-overlay" onClick={() => setPlaylistAdd(null)}></div>
          <div className="PPA-popup-edit">
            <h3>Ajouter une playlist</h3>

            <label>
              Nom :
              <input
                type="text"
                value={playlistAdd.nom}
                placeholder="Nom de la playlist"
                onChange={(e) => setPlaylistAdd({ ...playlistAdd, nom: e.target.value })}
              />
            </label>

            <label>
              Image de couverture (URL) :
              <input
                type="text"
                value={playlistAdd.imageCouv}
                placeholder="URL de l'image"
                onChange={(e) => setPlaylistAdd({ ...playlistAdd, imageCouv: e.target.value })}
              />
            </label>

            {messagePopup && <p className="PPA-popup-message">{messagePopup}</p>}

            <div className="PPA-popup-actions">
              <button className="PPA-btn-validate" onClick={createPlaylist}>Valider</button>
              <button className="PPA-btn-cancel" onClick={() => setPlaylistAdd(null)}>Annuler</button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}