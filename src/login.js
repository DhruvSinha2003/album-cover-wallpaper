import React, { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("hello");

  return (
    <div>
      <h1 className="header">{username}</h1>
      <form action="submit">
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default Login;
