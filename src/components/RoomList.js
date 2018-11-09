import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

class RoomsList extends Component {
  render() {
    const {
      rooms,
      handleRoomClick,
      user,
      handleRemoveRoom,
      handleRenameRoom
    } = this.props;
    return (
      <div className="rooms-list">
        <h3>Rooms</h3>
        {rooms.map(room => (
          <Link to={`/room/${room.key}&${room.name}`} key={room.key}>
            <Room
              room={room}
              handleRoomClick={e => handleRoomClick(e)}
              buttonsEnabled={user ? true : false}
              handleRemoveRoom={() => handleRemoveRoom(room)}
              handleRenameRoom={() => handleRenameRoom(room)}
            />
          </Link>
        ))}
      </div>
    );
  }
}

const Room = props => {
  const {
    room,
    handleRoomClick,
    buttonsEnabled,
    handleRemoveRoom,
    handleRenameRoom
  } = props;
  return (
    <div className="room">
      <div onClick={() => handleRoomClick(room)}># {room.name}</div>
      {buttonsEnabled ? (
        <div>
          <button
            name="delete-room"
            className="icon ion-md-remove-circle"
            onClick={() => handleRemoveRoom(room)}
          />
          <button
            name="rename-room"
            className="icon ion-md-create"
            onClick={() => handleRenameRoom(room)}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
class RoomForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      roomName: e.target.value
    });
  }

  clearInput() {
    this.setState({
      roomName: ""
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const { roomName } = this.state;
    return (
      <form
        className="create-room"
        onSubmit={e => {
          handleSubmit(e, roomName);
          this.clearInput();
        }}
      >
        <input type="text" value={roomName} onChange={this.handleInputChange} />
        <input type="submit" value="New room" />
      </form>
    );
  }
}

class Rooms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    };
    this.roomsRef = this.props.firebase.database().ref("rooms");
  }

  componentDidMount() {
    this.roomsRef.on("child_added", snapshot => {
      this.updateCreatedRooms(snapshot);
    });
    this.roomsRef.on("child_changed", snapshot => {
      this.updateRenamedRooms(snapshot);
    });
    this.roomsRef.on("child_removed", snapshot => {
      this.updateDeletedRooms(snapshot);
    });
  }

  updateCreatedRooms(snapshot) {
    const room = snapshot.val();
    room.key = snapshot.key;
    this.setState({
      rooms: this.state.rooms.concat(room)
    });
  }

  updateRenamedRooms(snapshot) {
    const index = this.state.rooms.map(room => room.key).indexOf(snapshot.key);
    const updatedRooms = [...this.state.rooms];
    updatedRooms[index].name = snapshot.val().name;
    this.setState({
      rooms: updatedRooms
    });
  }

  updateDeletedRooms(snapshot) {
    const deletedRoom = snapshot.val();
    deletedRoom.key = snapshot.key;
    this.setState({
      rooms: this.state.rooms.filter(room => room.key !== deletedRoom.key)
    });
    this.props.deletedRoom(deletedRoom);
  }

  componentWillUnmount() {
    this.roomsRef.off();
  }

  createRoom(e, roomName) {
    e.preventDefault();
    if (roomName) {
      if (!this.state.rooms.filter(room => room.name === roomName).length > 0) {
        this.roomsRef.push({
          name: roomName
        });
      } else {
        alert(`"${roomName}" already exists. Choose another name`);
      }
    } else {
      alert("Please provide a name");
    }
  }

  removeRoom(room) {
    this.roomsRef
      .child(room.key)
      .remove()
      .then(() => {
        alert(`Room "${room.name}" has been deleted`);
        this.props.history.goBack();
      })
      .catch(error => console.log(error));
  }

  renameRoom(room) {
    const newRoomName = prompt("Rename your room", room.name);
    if (newRoomName === null || newRoomName === room.name) {
      return;
    } else {
      this.roomsRef.child(room.key).set({ name: newRoomName });
    }
  }

  render() {
    const { rooms } = this.state;
    const { handleRoomClick, user } = this.props;
    return (
      <section className="rooms">
        <RoomsList
          rooms={rooms}
          handleRoomClick={e => handleRoomClick(e)}
          user={user}
          handleRemoveRoom={room => this.removeRoom(room)}
          handleRenameRoom={room => this.renameRoom(room)}
        />
        <RoomForm
          handleSubmit={(e, roomName) => this.createRoom(e, roomName)}
        />
      </section>
    );
  }
}

export default withRouter(Rooms);
