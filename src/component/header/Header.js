
import "./Header.css";
import ProfileCard from "./ProfileCard";
import { Link, useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate();


  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src="/logo.png"
            alt="FIM_LOAN"
            style={{ width: "100px", height: "auto" }}
          />
        </Link>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link active" aria-current="page" to="/userloan">
              Dashboard
            </Link>
          </li>
        </ul>
        <nav>
          <ProfileCard
          />
        </nav>
      </div>
    </nav>
  );
};

export default Header;
