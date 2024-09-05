import React, { useEffect, useState } from "react";
import Home from "./Home";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [albumCover, setAlbumCover] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccessToken();
  }, []);

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get access token. Status: ${response.status}. Response: ${errorText}`
        );
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error("Access token not found in the response");
      }
      setAccessToken(data.access_token);
      console.log("Access token obtained successfully");
    } catch (error) {
      console.error("Error getting access token:", error);
      setError(`Failed to initialize Spotify API: ${error.message}`);
    }
  };

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

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        const data = await response.json();
        setSuggestions(data.albums.items.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to fetch suggestions. Please try again.");
      }
    } else {
      setSuggestions([]);
    }
  };

  const searchAlbum = async (album) => {
    setAlbumName(album);
    setSuggestions([]);

    if (!accessToken) {
      setError("No access token available. Please try again later.");
      return;
    }

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

      if (!searchResponse.ok) {
        throw new Error("Failed to fetch album data");
      }

      const searchData = await searchResponse.json();

      if (searchData.albums.items.length > 0) {
        setAlbumCover(searchData.albums.items[0].images[0].url);
        setError(null);
      } else {
        setAlbumCover(null);
        setError("No album found with that name");
      }
    } catch (error) {
      console.error("Error fetching album cover:", error);
      setError("Failed to fetch album cover. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Spotify Album Cover Search</h1>
      <div>
        <input
          type="text"
          value={albumName}
          onChange={handleInputChange}
          placeholder="Enter album name"
        />
        <button onClick={() => searchAlbum(albumName)}>Search</button>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      {albumCover && (
        <div>
          <h2>Album Cover:</h2>
          <img
            src={albumCover}
            alt="Album Cover"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
