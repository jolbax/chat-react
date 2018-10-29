import React, { Component } from "react";
import withUser from "./withUser";

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
    this.usersRef = this.props.firebase.database().ref("users");
  }

  componentDidMount() {
    this.usersRef.on("child_added", snapshot => {
      const user = snapshot.val();
      user.key = snapshot.key;
      this.setState({ users: this.state.users.concat(user) });
    });
    this.usersRef.on("child_changed", snapshot => {
      const index = this.state.users
        .map(user => user.key)
        .indexOf(snapshot.key);
      const updatedUsers = [...this.state.users];
      updatedUsers[index].online = snapshot.val().online;
      this.setState({
        users: updatedUsers
      });
    });
  }

  render() {
    return (
      <section className="user-list">
        <h3>Users</h3>
          <div className="users"></div>
        {this.state.users.map(
          user =>
            user.online === true ? (
              <div className="user" key={user.key}>● {user.displayName}</div>
            ) : null
        )}
      </section>
    );
  }
}

export default withUser(UserList);
