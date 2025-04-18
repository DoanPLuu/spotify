import React from "react";
import { FaHome, FaPlus, FaHeart } from "react-icons/fa";

const playlists = [
  { name: "Urban Nights", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Coastal Dreaming", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Eastern Dreams", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Test Album", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "House Party Mix", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Piano Classics", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Rock Anthems", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Lo-Fi Beats", image: "./src/assets/images/cover-images/5.jpg" },
  { name: "Summer Hits", image: "./src/assets/images/cover-images/5.jpg" },
];

const LeftSidebar = () => {
  return (
    <div className="left-sidebar">
       <div className="library-section">
        <ul className="nav-menu">
          <li className="active">
            <FaHome />
            <span>Thư viện của bạn</span>
          </li>
        </ul>
      </div>

      <ul className="nav-menu">
        <li>
          <FaPlus
            style={{
              backgroundColor: "#b3b3b3",
              color: "black",
              padding: "5px",
              borderRadius: "2px",
              fontSize: "1.2rem",
            }}
          />
          <span>Tạo playlist của riêng bạn</span>
        </li>
        <li>
          <FaHeart
            style={{
              background: "linear-gradient(135deg, #450af5, #c4efd9)",
              padding: "5px",
              borderRadius: "2px",
              fontSize: "1.2rem",
            }}
          />
          <span>Các bài hát bạn yêu thích</span>
        </li>
      </ul>

      <div className="playlists-section">
        <h2>Playlists</h2>
        <div className="playlist-card-container">
          {playlists.map((playlist, index) => (
            <div className="playlist-card" key={index}>
              <div className="playlist-card-img-container">
                <img
                  src={playlist.image}
                  alt={playlist.name}
                  className="playlist-card-img"
                />
                <div className="play-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="playlist-card-title">{playlist.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;