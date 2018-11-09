import * as firebase from "firebase";
import React, { Component } from "react";
import { Route } from "react-router-dom";
import Rooms from "./components/RoomList";
import Messages from "./components/MessageList";
import User from "./components/User";
import "./App.css";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDa0wveyGiBrYjWEafAFBB6fRCOMiOzB-8",
  authDomain: "react-chat-7f917.firebaseapp.com",
  databaseURL: "https://react-chat-7f917.firebaseio.com",
  projectId: "react-chat-7f917",
  storageBucket: "react-chat-7f917.appspot.com",
  messagingSenderId: "149441008954"
};
firebase.initializeApp(config);

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      activeRoom: "",
      deletedRoom: ""
    };

    this.handleRoomClick = this.handleRoomClick.bind(this);
    this.setDeletedRoom = this.setDeletedRoom.bind(this);
    this.handleSetUser = this.handleSetUser.bind(this);
  }

  handleRoomClick(room) {
    this.setState({
      activeRoom: room,
    });
  }

  handleSetUser = (user) => {
    this.setState({
      user: user
    });
  }

  setDeletedRoom(room) {
    this.setState({ deletedRoom: room });
  }

  render() {
    const { user, deletedRoom } = this.state;
    return (
      <div>
        {this.props.render(
          user,
          deletedRoom,
          this.handleRoomClick,
          this.setDeletedRoom,
          this.handleSetUser
        )}
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Chat
        render={(
          user,
          deletedRoom,
          handleRoomClick,
          setDeletedRoom,
          handleSetUser
        ) => (
          <div className="app">
            <header>
              <h1>React Chat</h1>
            </header>
            <aside>
              <User
                firebase={firebase}
                setUser={user => handleSetUser(user)}
                user={user}
              />
              <Rooms
                firebase={firebase}
                handleRoomClick={room => handleRoomClick(room)}
                deletedRoom={room => setDeletedRoom(room)}
                user={user}
              />
            </aside>
            <main>
              <Route
                path="/room/:roomId&:roomName"
                render={() => (
                  <Messages
                    firebase={firebase}
                    user={user}
                    deletedRoom={deletedRoom}
                  />
                )}
              />
            </main>
          </div>
        )}
      />
    );
  }
}

export default App;
