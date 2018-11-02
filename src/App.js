import * as firebase from "firebase";
import React, { Component } from "react";
import { Route } from "react-router-dom";
import RoomList from "./components/RoomList";
import MessageList from "./components/MessageList";
import User from "./components/User";
import UserList from "./components/UserList";
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRoomName: "",
      activeRoomId: "",
      deletedRoom: ""
    };
  }

  handleRoomClick(room) {
    this.setState({
      activeRoomName: room.name,
      activeRoomId: room.key
    });
  }

  setDeletedRoom(room) {
    this.setState({
      activeRoomName: "",
      activeRoomId: "",
      deletedRoom: room
    });
  }

  render() {
    return (
      <div className="app">
        <header>
          <h1>React Chat</h1>
        </header>
        <aside>
          <User firebase={firebase} />
          <UserList firebase={firebase} />
          <RoomList
            firebase={firebase}
            handleRoomClick={room => this.handleRoomClick(room)}
            deletedRoom={room => this.setDeletedRoom(room)}
          />
        </aside>
        <main>
          <Route
            path="/room/:roomId&:roomName"
            render={() => (
              <MessageList
                firebase={firebase}
                activeRoomName={this.state.activeRoomName}
                activeRoomId={this.state.activeRoomId}
                deletedRoom={this.state.deletedRoom}
              />
            )}
          />
        </main>
      </div>
    );
  }
}

export default App;
