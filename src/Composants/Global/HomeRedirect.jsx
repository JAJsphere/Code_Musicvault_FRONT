import React from "react";
import { Navigate } from "react-router-dom";

// Ce composant gère la route : "/" (la racine de l'application) 
/* Ex : Quand quelqu'un tape juste monsite.com/ sans préciser de page, React sait pas où envoyer l'user
        Donc HomeRedirect regarde le rôle et redirige au bon endroit : */


export default function HomeRedirect({ user }) {

  // Si pas connecté, redirection vers login
  if (!user) return <Navigate to="/login" replace />;

  // Si connecté, redirection selon le rôle
  if (user.role === "admin") return <Navigate to="/Acatalogue" replace />;
  if (user.role === "editeur") return <Navigate to="/Ecatalogue" replace />;
  if (user.role === "user") return <Navigate to="/Ucatalogue" replace />;

  // Si connecté mais rôle inconnu (sécurité) -> redirection vers login
  return <Navigate to="/login" replace />;

}