import React, { Component } from "react";
import { Link } from "react-router-dom";

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
        this.clearInput();
      } else {
        alert(
          `"${this.state.newRoomName}" already exists. Choose another name`
        );
      }
    } else {
      alert("Please provide a name");
    }
  }

  removeRoom(room) {
    this.roomsRef
      .child(room.key)
      .remove()
      .then(() => alert(`Room "${room.name}" has been deleted`))
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
        <div className="rooms">
          {this.state.rooms.map(room => (
            <div className="room" key={room.key}>
              <Link to={`/room/${room.key}&${room.name}`} key={room.key}>
                <div onClick={() => this.props.handleRoomClick(room)}>
                  # {room.name}
                </div>
              </Link>
              {this.props.username !== "Guest" ? (
                <div>
                  <button
                    name="delete-room"
                    className="icon ion-md-remove-circle"
                    onClick={() => this.removeRoom(room)}
                  />
                  <button
                    name="rename-room"
                    className="icon ion-md-create"
                    onClick={() => this.renameRoom(room)}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
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
