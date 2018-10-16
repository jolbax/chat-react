import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class RoomList extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const newRoomName = this.newRoomName.value;
    this.roomsRef.push({
      name: newRoomName
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
          <label>
            Add a new chat room:
            <input type="text" ref={e => (this.newRoomName = e)} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </section>
    );
  }
}

export default RoomList;
