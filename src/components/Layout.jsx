import MainNavigation from "./Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <MainNavigation>
        <Outlet />
      </MainNavigation>
    </div>
  );
}

export default Layout;
