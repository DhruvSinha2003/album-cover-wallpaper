import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [albumCover, setAlbumCover] = useState(null);
  const [albumInfo, setAlbumInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
          },
          body: "grant_type=client_credentials",
        });

        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };
    getAccessToken();
  }, []);

  const handleInputChange = async (event) => {
    const input = event.target.value;
    setSearchTerm(input);

    if (input.length > 2) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            input
          )}&type=album&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setSuggestions(
          data.albums.items.map((item) => ({
            name: item.name,
            artist: item.artists[0].name,
            thumbnail: item.images[2].url,
            id: item.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const searchAlbum = async (albumId) => {
    setSuggestions([]);
    try {
      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const albumData = await albumResponse.json();

      if (albumData) {
        setAlbumCover(albumData.images[0].url);
        setAlbumInfo({
          name: albumData.name,
          artist: albumData.artists[0].name,
        });
        setSearchTerm(`${albumData.name} - ${albumData.artists[0].name}`);
      } else {
        setAlbumCover(null);
        setAlbumInfo(null);
      }
    } catch (error) {
      console.error("Error fetching album:", error);
    }
  };

  return (
    <div
      className="home-container"
      style={{ marginTop: albumCover ? "0" : "10%" }}
    >
      {" "}
      <div className="home-content">
        <h1>Album Cover Art</h1>
        {!albumCover && (
          <p className="intro-text">
            Transform album covers into personalized wallpapers for any device.
          </p>
        )}
        <div className="search-wrapper">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Enter Album Name"
              className="search-input"
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => searchAlbum(suggestion.id)}
                    className="suggestion-item"
                  >
                    <img
                      src={suggestion.thumbnail}
                      alt={`${suggestion.name} thumbnail`}
                      className="suggestion-thumbnail"
                    />
                    <div className="suggestion-info">
                      <span className="suggestion-album">
                        {suggestion.name}
                      </span>
                      <span className="suggestion-artist">
                        {suggestion.artist}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {albumCover && (
          <div className="album-display">
            <div className="album-cover-container">
              <img
                src={albumCover}
                alt="album cover"
                className="home-album-cover"
              />
            </div>
            <div className="album-info">
              <div className="album-info-content">
                {albumInfo && (
                  <>
                    <h2>{albumInfo.name}</h2>
                    <h3>{albumInfo.artist}</h3>
                  </>
                )}
                <Link to="/create" state={{ image: albumCover }}>
                  <button className="create-wallpaper-button">
                    Create a wallpaper
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
