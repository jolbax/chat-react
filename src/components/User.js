import React, { Component } from "react";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      token: ""
    };
  }
  handleAuth() {
    const provider = new this.props.firebase.auth.GoogleAuthProvider();
    const auth = this.props.firebase.auth();
    if (this.state.user) {
      auth
        .signOut()
        .then(() => {
          this.setState({
            token: "",
            user: ""
          });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      auth
        .signInWithPopup(provider)
        .then(result => {
          this.setState({
            token: result.credential.accessToken,
            user: result.user
          });
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
    }
  }

  render() {
    return (
      <section className="user-authentication">
        <label>
          {this.state.user ? `Hi ${this.state.user.displayName}` : "Welcome!"}
          <input
            name="signin-button"
            type="submit"
            value={this.state.user ? "Sign-out" : "Sign-in"}
            onClick={() => this.handleAuth()}
          />
        </label>
      </section>
    );
  }
}

export default User;
