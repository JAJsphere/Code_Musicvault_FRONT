import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Music } from 'lucide-react';
import "./Navbar.css"

export default function Navbar({ userRole, setUser }) {
  // userRole -> Pour savoir quels onglets afficher dans la navbar selon le rôle de l'utilisateur connecté
  /* setUser -> Modifie le state "user" dans App.jsx -> si on lui passe un objet { role, id } = utilisateur connecté, 
                si on lui passe null = utilisateur déconnecté -> App.jsx réagit et affiche en conséquence */

  // Ici, la navbar utilise setUser uniquement pour la déconnexion (car bouton de déco est dans la navbar) 


  const navigate = useNavigate(); // State pour redirection page login -> seDeconnecter


  // Fonction pour le bouton Déconnexion 
  const seDeconnecter = () => {

    sessionStorage.clear(); // Supprime tout le sessionStorage -> le token et les infos de l'utilisateur sont supprimés

    setUser(null); // Met à jour le state "user" dans App.jsx -> utilisateur déconnecté -> redirection vers login

    navigate("/login"); // Redirection vers la page de login après la déconnexion

  };


  // Affichage de la navbar selon le rôle de l'utilisateur connecté (userRole) -> 3 versions différentes pour les 3 rôles (admin, éditeur, utilisateur)
  if (userRole === "admin") {
    return (

      // Navbar pour l'administrateur -> 3 onglets : Catalogue, Playlists, Gestion
      <header className="header">
        <div className="logo-link">
          <div className="logo-circle">
            <Music size={20} />
          </div>
          <span className="logo-text">MusicVault</span>
        </div>


        {/* Navlink -> Les onglets de navigation (isActive -> feature intégrée de NavLink) */}
        <nav className="nav">
          <NavLink to="/Acatalogue" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}> {/* Si onglet actif -> affichage d'un CSS différent (souligné et coloré) */}
            Catalogue
          </NavLink>

          <NavLink  // + Vérif si le l'URL actuelle commence par "/Aplaylist"
            to="/Aplaylist" className={({ isActive }) => isActive || window.location.pathname.startsWith("/Aplaylist") ? "nav-link active" : "nav-link"} >
            Playlists
          </NavLink>

          <NavLink to="/Agestion" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Gestion
          </NavLink>
        </nav>


        {/* Le bouton de déconnexion */}
        <button className="logout-btn" onClick={seDeconnecter}>
          <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '8px' }} />
          Déconnexion
        </button>

      </header>
    );
  }



  {/* Navbar pour l'éditeur -> 2 onglets : Catalogue, Playlists */ }
  if (userRole === "editeur") {

    return (
      <header className="header">
        <div className="logo-link">
          <div className="logo-circle">
            <Music size={20} />
          </div>
          <span className="logo-text">MusicVault</span>
        </div>

        {/* Navlink -> Les onglets de navigation */}
        <nav className="nav">
          <NavLink to="/Ecatalogue" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Catalogue
          </NavLink>

          <NavLink
            to="/Eplaylist"
            className={({ isActive }) => isActive || window.location.pathname.startsWith("/Eplaylist") ? "nav-link active" : "nav-link"}>
            Playlists
          </NavLink>
        </nav>

        {/* Le bouton de déconnexion */}
        <button className="logout-btn" onClick={seDeconnecter}>
          <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '8px' }} />
          Déconnexion
        </button>

      </header>
    );
  }



  {/* Navbar pour l'utilisateur -> 2 onglets : Catalogue, Playlists */ }
  return (

    <header className="header">
      <div className="logo-link">
        <div className="logo-circle">
          <Music size={20} />
        </div>
        <span className="logo-text">MusicVault</span>
      </div>


      {/* Navlink -> Les onglets de navigation */}
      <nav className="nav">
        <NavLink to="/Ucatalogue" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Catalogue
        </NavLink>

        <NavLink
          to="/Uplaylist"
          className={({ isActive }) =>isActive || window.location.pathname.startsWith("/Uplaylist") ? "nav-link active" : "nav-link"}>
          Playlists
        </NavLink>
      </nav>

      {/* Le bouton de déconnexion */}
      <button className="logout-btn" onClick={seDeconnecter}>
        <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '8px' }} />
        Déconnexion
      </button>
      
    </header>
  );
}
