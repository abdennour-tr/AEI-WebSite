import MainNavigation from "./Navbar";
import ConnexionPage from "../pages/connexion";

function Layout({ children }) {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen font-sans">
      <MainNavigation>{children}</MainNavigation>
    </div>
  );
}

export default Layout;
