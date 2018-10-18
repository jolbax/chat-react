import React, { Component } from "react";

class User extends Component {
  componentDidMount() {
    this.props.firebase
      .auth()
      .onAuthStateChanged(user => this.props.setUser(user));
  }

  handleAuth(status) {
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    const auth = this.props.firebase.auth();
    if (this.props.userLoggedIn) {
      auth.signOut().catch(error => {
        console.log(error);
      });
    } else {
      auth.signInWithPopup(provider).catch(error => {
        console.log(error.code, error.message);
      });
    }
  }

  render() {
    return (
      <section className="user-authentication">
        <label>
          {this.props.userLabel}
          <input
            type="submit"
            value={this.props.buttonValue}
            onClick={() => this.handleAuth()}
          />
        </label>
      </section>
    );
  }
}

export default User;
