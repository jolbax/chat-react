import * as firebase from "firebase";
import React, { Component } from "react";
import { Route } from "react-router-dom";
import RoomList from "./components/RoomList";
import MessageList from "./components/MessageList";
import "./App.css";

// Initialize Firebase
var config = {
  apiroomId: "AIzaSyDa0wveyGiBrYjWEafAFBB6fRCOMiOzB-8",
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
        currentChatRoomName: "",
        currentChatRoomId: ""
    };
  }

  handleRoomClick(room) {
    console.log("Click on: " +  room.name, room.key);


    this.setState({
      currentChatRoomName: room.name,
      currentChatRoomId: room.key
    });
  }

  render() {
    return (
      <div className="app">
        <header>
          <h1>React Chat</h1>
        </header>
        <aside>
          <RoomList firebase={firebase} handleRoomClick={(room) => this.handleRoomClick(room)} />
        </aside>
        <main>
          <Route
            path="/room/:roomId"
            render={() =>
                 <MessageList
                  firebase={firebase}
                  currentChatRoomName={this.state.currentChatRoomName}
                  currentChatRoomId={this.state.currentChatRoomId}
              />
            }
          />
        </main>
      </div>
    );
  }
}

export default App;
