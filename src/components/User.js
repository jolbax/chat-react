import React from "react";
import withUser from "./withUser";

const renderUser = ({ userData, stateHandler }) => {
  return (
    <section className="user-authentication">
      <label>
        {userData ? userData.displayName : "Guest"}
        <input type="submit" value={userData ? "Sign-out" : "Sign-in"} onClick={() => stateHandler()} />
      </label>
    </section>
  );
};

const User = withUser(renderUser, props => props);

export default User;
