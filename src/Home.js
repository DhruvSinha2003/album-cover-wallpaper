import React, { useEffect, useState } from "react";
import "./Home.css";
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

function Home = () => {
  const [accessToken, setAccessToken] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [albumCover, setAlbumCover] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{

  }, []);

  const getAccessToken = async() => {
    try{
      const response = await fetch( "https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        },
        body: "grant_type=client_credentials",
      });
      
      const data = response.json();

      setAccessToken(data.accessToken);

    }catch(error) {
      console.log(error);
    }
  }
  
    return(
      <div className="container">

      </div>
    )
};

export default Home;
