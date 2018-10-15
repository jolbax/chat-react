import * as firebase from 'firebase';
import React, { Component } from 'react';
import RoomList from './components/RoomList';
import './App.css';

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
  render() {
    return (
      <div className="app">
        <RoomList firebase={firebase}/>
      </div>
    );
  }
}

export default App;
