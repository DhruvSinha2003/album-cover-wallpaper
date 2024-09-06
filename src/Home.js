import React, { useEffect, useState } from "react";
import "./Home.css";
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [albumCover, setAlbumCover] = useState(null);
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
        console.log(error);
      }
    };
    getAccessToken();
  }, []);

  const handleInputChange = async (event) => {
    const input = event.target.value;
    setAlbumName(input);

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
        setSuggestions(data.albums.items.map((item) => item.name));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const searchAlbum = async (album) => {
    setAlbumName(album);
    setSuggestions([]);
    try {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          album
        )}&type=album&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const searchData = await searchResponse.json();

      if (searchData.albums.items.length > 0) {
        setAlbumCover(searchData.albums.items[0].images[0].url);
      } else {
        setAlbumCover(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="container">
        <h1>Album Cover Art</h1>
        <input
          type="text"
          value={albumName}
          onChange={handleInputChange}
          placeholder="Enter Album Name"
        />
        <button onClick={() => searchAlbum(albumName)}>Submit</button>
      </div>
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => searchAlbum(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {albumCover && (
        <img
          src={albumCover}
          alt="album cover"
          style={{ maxWidth: "500px", maxHeight: "500px" }}
        />
      )}
    </>
  );
}

export default Home;
