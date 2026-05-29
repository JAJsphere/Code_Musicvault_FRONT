import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Login from './Composants/Global/Login'

import Navbar from './Composants/Global/Navbar'
import Footer from './Composants/Global/Footer'

import PanelMusiquesA from './Composants/Administrateur/PanelMusiquesA' // le seul qui a un "s" dans "Musique"
import PanelMusiqueU from './Composants/Utilisateur/PanelMusiqueU'
import PanelMusiqueE from './Composants/Editeur/PanelMusiqueE'

import PanelPlaylistA from './Composants/Administrateur/PanelPlaylistA'
import PanelPlaylistE from './Composants/Editeur/PanelPlaylistE'
import PanelPlaylistU from './Composants/Utilisateur/PanelPlaylistU'

import PanelGestionA from './Composants/Administrateur/PanelGestionA'

import PanelPlaylistMusiqueA from './Composants/Administrateur/PanelPlaylistMusiqueA'
import PanelPlaylistMusiqueE from './Composants/Editeur/PanelPlaylistMusiqueE'
import PanelPlaylistMusiqueU from './Composants/Utilisateur/PanelPlaylistMusiqueU'

import HomeRedirect from './Composants/Global/HomeRedirect'


export default function App() {

  const [user, setUser] = useState(null); // Stocke les informations de l'utilisateur connecté (utilisé dans Navbar et HomeRedirect)  
  const [loading, setLoading] = useState(true); /* Permet d'éviter d'afficher quelques secondes la page de login avant de vérifier la session 
                                                  (car au début user = null, donc redirection vers login, puis on vérifie la session et on met à jour user si session valide -> si pas de loading, on verrait la page de login s'afficher quelques secondes à chaque rechargement de la page même si l'utilisateur est déjà connecté) */


  // Au rechargement de la page -> On garde la session pour éviter d'être déconnecté à chaque fois (car React repart de 0 et user est remis à null) 
  useEffect(() => {

    // On récupère les infos de l'utilisateur dans le sessionStorage (si elles existent)
    const role = sessionStorage.getItem("role");
    const id = sessionStorage.getItem("idUtilisateur");

    // Si elles existent
    if (role && id) {
      setUser({ role, id }); // On met à jour le state "user" avec ces infos pour que l'user reste connecté même après un rechargement de la page
    }

    setLoading(false); // Le sessionStorage a été vérifié, on peut afficher la page


  }, []); // S'éxécute une seule fois au montage du composant (au chargement de la page)


  if (loading) { return null; } // Tant que le chargement de session n'est pas terminé, on n'affiche rien


  // Si pas connecté, on affiche QUE le login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} /> {/* Le premier setUser = le paramètre du composant Login, 
                                                                          le deuxième = la valeur qu'on lui passe, on lui donne la fonction du state pour que Login puisse le mettre à jour 
                                                                          Login collecte les infos (via le formulaire), puis les envoie à App.jsx via setUser*/}
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* Le path="*" -> Si l'utilisateur n'est pas connecté et essaie d'accéder à n'importe quelle URL -> redirige vers login */}
      </Routes>
    );
  }



  // Si connecté, on affiche Navbar + Routes protégées + Footer
  return (
    <>


      {/* Si user existe -> afficher Navbar et passe lui le rôle ainsi que la fonction setUser (pour pouvoir l'utiliser pour déconnexion) */}
      {user && <Navbar userRole={user.role} setUser={setUser} />} {/* -> ne s'affiche QUE quand l'utilisateur est connecté */}


      <Routes>

        {/* --- ROUTE DES ADMINS --- */}
        <Route
          path="/Acatalogue" // Si l'URL est "/Acatalogue" -> vérifier le rôle
          element={user.role === "admin" ? <PanelMusiquesA /> : <Navigate to="/login" replace />}
        />

        {/* Replace -> remplace /Acatalogue dans l'historique par /login
            comme ça si on appuie sur retour, on retombe pas sur /Acatalogue qui redirige encore vers /login, et on évite une boucle de redirection */}
            

        <Route
          path="/Aplaylist"
          element={user.role === "admin" ? <PanelPlaylistA /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Agestion"
          element={user.role === "admin" ? <PanelGestionA /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Aplaylist/:idPlaylist"
          element={user.role === "admin" ? <PanelPlaylistMusiqueA /> : <Navigate to="/login" replace />}
        />
        {/* --- FIN ROUTE ADMINS --- */}




        {/* -- ROUTE DES EDITEURS -- */}
        <Route
          path="/Ecatalogue"
          element={user.role === "editeur" ? <PanelMusiqueE /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Eplaylist"
          element={user.role === "editeur" ? <PanelPlaylistE /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Eplaylist/:idPlaylist"
          element={user.role === "editeur" ? <PanelPlaylistMusiqueE /> : <Navigate to="/login" replace />}
        />
        {/* -- FIN ROUTE EDITEURS -- */}




        {/* -- ROUTE UTILISATEURS -- */}
        <Route
          path="/Ucatalogue"
          element={user.role === "user" ? <PanelMusiqueU /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Uplaylist"
          element={user.role === "user" ? <PanelPlaylistU /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/Uplaylist/:idPlaylist"
          element={user.role === "user" ? <PanelPlaylistMusiqueU /> : <Navigate to="/login" replace />}
        />
        {/* -- FIN ROUTE UTILISATEURS -- */}






        {/* --- ROUTES PAR DEFAUT --- */}

        {/* Route racine -> redirection intelligente selon rôle */}
        <Route path="/" element={<HomeRedirect user={user} />} />

        {/* Si l'URL est /, affiche HomeRedirect en lui passant user en paramètre pour qu'il sache où rediriger selon le rôle */}

        {/* Route inconnue -> retour à la page catalogue selon le rôle */}
        <Route path="*" element={<HomeRedirect user={user} />} />
 
        {/* --- FIN ROUTES DEFAUT --- */}

      </Routes >


      <Footer /> {/* -> ne s'affiche QUE quand l'utilisateur est connecté */}

  

    </>
  )
}