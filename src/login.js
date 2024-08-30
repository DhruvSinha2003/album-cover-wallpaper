import React, { Component, useState } from "react";

export default class login extends Component {

  function submit(){
    setUsername()
  }

  const [username, setUsername] = useState("hello");
    render() {
    return (
      <div>
        <h1 className="header">Login to your existing account</h1>
        <form action="submit">
          <input type="text" placeholder="username" value={username} />
          <button onClick={submit()}>Submit</button>
        </form>
      </div>
    );
  }
}
