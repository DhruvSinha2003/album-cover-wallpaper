import React, { Component, useState } from "react";

export default class login extends Component {

  const username = (setUsername)
  render() {
    return (
      <div>
        <h1 className="header">Login to your existing account</h1>
        <form action="submit">
          <input type="text" placeholder="username" />
        </form>
      </div>
    );
  }
}
