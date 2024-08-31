import React, { useEffect, useState } from "react";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [albumCover, setAlbumCover] = useState(null);

  useEffect(() => {
    // Get access token when component mounts
    getAccessToken();
  }, []);

  const getAccessToken = async () => {
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
  };

  const handleInputChange = (event) => {
    setAlbumName(event.target.value);
  };

  const searchAlbum = async () => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    try {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          albumName
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
        alert("No album found with that name");
      }
    } catch (error) {
      console.error("Error fetching album cover:", error);
    }
  };

  return (
    <div className="App">
      <input
        type="text"
        value={albumName}
        onChange={handleInputChange}
        placeholder="Enter album name"
      />
      <button onClick={searchAlbum}>Search</button>
      {albumCover && <img src={albumCover} alt="Album Cover" />}
    </div>
  );
}

export default App;
