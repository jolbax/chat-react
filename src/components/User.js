import React, { Component } from "react";

const LogOn = props => {
  const { userLabel, buttonValue, handleOnClick } = props;
  return (
    <label>
      {userLabel}
      <input type="submit" value={buttonValue} onClick={handleOnClick} />
    </label>
  );
};
class User extends Component {
  componentDidMount() {
    this.props.firebase
      .auth()
      .onAuthStateChanged(user => this.props.setUser(user));
    this.handleAuth = this.handleAuth.bind(this);
  }

  handleAuth() {
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    const auth = this.props.firebase.auth();
    if (this.props.user) {
      auth
        .signOut()
        .then(() => this.setUser(null))
        .catch(error => {
          console.log(error);
        });
    } else {
      auth.signInWithPopup(provider).catch(error => {
        console.log(error.code, error.message);
      });
    }
  }

  render() {
    const { user } = this.props;
    return (
      <section className="user-authentication">
        <LogOn
          userLabel={user ? `${user.displayName}` : "Guest"}
          buttonValue={user ? "Sign-out" : "Sign-in"}
          handleOnClick={this.handleAuth}
        />
      </section>
    );
  }
}

export default User;
