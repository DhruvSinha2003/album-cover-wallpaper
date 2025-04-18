import { useEffect, useRef, useState } from "react";
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
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

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

  // Canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const particleCount = 50;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
          Math.random() * 100 + 155
        )}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.1})`,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
      });

      // Connect particles with lines if they're close enough
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${
              0.1 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
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
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="glass-overlay">
        <div className="inner-glow"></div>
      </div>
      <div className="home-content">
        <h1 className="title-text">Album Cover Art</h1>
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
                      src={suggestion.thumbnail || "/placeholder.svg"}
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
                src={albumCover || "/placeholder.svg"}
                alt="album cover"
                className="home-album-cover"
              />
              <div className="album-glow"></div>
            </div>
            <div className="album-info">
              <div className="album-info-content">
                {albumInfo && (
                  <>
                    <h2 className="album-title">{albumInfo.name}</h2>
                    <h3 className="album-artist">{albumInfo.artist}</h3>
                  </>
                )}
                <Link to="/create" state={{ image: albumCover }}>
                  <button className="create-wallpaper-button">
                    <span>Create a wallpaper</span>
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
