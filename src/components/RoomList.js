import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class RoomList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newRoomName: "",
      rooms: []
    };
    this.roomsRef = this.props.firebase.database().ref("rooms");
  }

  componentDidMount() {
    this.roomsRef.on("child_added", snapshot => {
      const room = snapshot.val();
      room.key = snapshot.key;
      this.setState({
        rooms: this.state.rooms.concat(room)
      });
    });
  }

  createRoom(e) {
    e.preventDefault();
    if (this.state.newRoomName) {
      if (
        !this.state.rooms.filter(room => room.name === this.state.newRoomName)
          .length > 0
      ) {
        this.roomsRef.push({
          name: this.state.newRoomName
        });
      } else {
        alert(`"${this.state.newRoomName}" already exists. Choose another name`);
      }
    } else {
      alert('Please provide a name');
    }
  }

  handleInputChange(e) {
    this.setState({
      newRoomName: e.target.value
    });
  }

  clearInput() {
    this.setState({
      newRoomName: ""
    });
  }

  render() {
    return (
      <section className="rooms-list">
        <ul className="current-list">
          {this.state.rooms.map(room =>
            <Link to={`/room/${room.key}`} key={room.key}>
                <li key={room.key} onClick={() => this.props.handleRoomClick(room)}>{room.name}</li>
            </Link>
          )}
        </ul>
        <form className="create-room" onSubmit={e => this.createRoom(e)}>
          <input
            type="text"
            value={this.state.newRoomName}
            onChange={e => this.handleInputChange(e)}
          />
          <input type="submit" value="New room" />
        </form>
      </section>
    );
  }
}

export default RoomList;
