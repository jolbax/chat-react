import * as firebase from "firebase";
import React, { Component } from "react";
import { Route } from "react-router-dom";
import RoomList from "./components/RoomList";
import MessageList from "./components/MessageList";
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      activeRoomName: "",
      activeRoomId: ""
    };
  }

  handleRoomClick(room) {
    this.setState({
      activeRoomName: room.name,
      activeRoomId: room.key
    });
  }

  setUser(user) {
    this.setState({
      user: user
    });
  }

  render() {
    return (
      <div className="app">
        <header>
          <h1>React Chat</h1>
        </header>
        <aside>
          <User
            firebase={firebase}
            setUser={user => this.setUser(user)}
            userLabel={
              this.state.user ? `${this.state.user.displayName}` : "Guest"
            }
            buttonValue={this.state.user ? "Sign-out" : "Sign-in"}
            userLoggedIn={this.state.user ? true : false}
          />
          <RoomList
            firebase={firebase}
            handleRoomClick={room => this.handleRoomClick(room)}
          />
        </aside>
        <main>
          <Route
            path="/room/:roomId"
            render={() => (
              <MessageList
                firebase={firebase}
                activeRoomName={this.state.activeRoomName}
                activeRoomId={this.state.activeRoomId}
                username={
                  this.state.user ? this.state.user.displayName : "Guest"
                }
              />
            )}
          />
        </main>
      </div>
    );
  }
}

export default App;
