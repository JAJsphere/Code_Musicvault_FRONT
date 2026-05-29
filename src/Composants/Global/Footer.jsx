import React from "react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-conteneur">

                {/* Logo et slogan */}
                <div className="footer-logo-section">
                    <h2 className="footer-logo">MusicVault</h2>
                    <p className="footer-slogan">Votre coffre à musique préféré</p>
                </div>

                {/* Copyright */}
                <div className="footer-copyright">
                    <p className="footer-texte-droits">&copy; 2026 MusicVault. Tous droits réservés.</p>
                </div>

            </div>
        </footer>
    );
}
