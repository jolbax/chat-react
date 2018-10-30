import React, { Component } from "react";

const withUser = BaseComponent => {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        user: "",
        onlineUsers: []
      };
      this.adminID = "F91Qpx9TxuacmCTO8YLuJPnPcKI2";
      this.setUser = this.setUser.bind(this);
      this.handleAuth = this.handleAuth.bind(this);

      this.usersRef = this.props.firebase.database().ref("users");
    }

    componentDidMount() {
      this.props.firebase.auth().onAuthStateChanged(user => {
        this.setUser(user);
      });

      this.usersRef.on("child_added", snapshot => {
        const user = snapshot.val();
        user.key = snapshot.key;
        this.setState({ onlineUsers: this.state.onlineUsers.concat(user) });
      });
    }

    componentWillUnmount() {
      this.usersRef.off();
    }

    setUser(user) {
      this.setState({ user: user });
    }

    handleAuth() {
      const provider = new this.props.firebase.auth.GoogleAuthProvider();
      const auth = this.props.firebase.auth();
      if (this.state.user) {
        auth
          .signOut()
          .then(() => {
            this.usersRef
              .child(this.state.user.uid)
              .child("online")
              .set(false)
              .catch(error => console.log(error));
            this.setUser(null);
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        auth
          .signInWithPopup(provider)
          .then(data => {
            this.usersRef
              .child(data.user.uid)
              .set({
                online: true,
                displayName: data.user.displayName,
                role: this.adminID === data.user.uid ? "admin" : "user"
              })
              .catch(error => console.log(error));
          })
          .catch(error => {
            console.log(error.code, error.message);
          });
      }
    }

    render() {
      return (
        <BaseComponent
          {...this.props}
          userData={this.state.user}
          onlineUsers={this.state.onlineUsers}
          stateHandler={this.handleAuth}
        />
      );
    }
  };
};

export default withUser;
