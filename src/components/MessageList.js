import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: "",
      messages: []
    };
    this.messagesRef = this.props.firebase.database().ref("messages");
  }

  componentDidMount() {
    this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId)
      .on("child_added", snapshot => {
        this.updateCreatedMessages(snapshot);
      });
    this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId)
      .on("child_removed", snapshot => {
        this.updateDeletedMessages(snapshot);
      });
    this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId)
      .on("child_changed", snapshot => {
        this.updateEditedMessages(snapshot);
      });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.roomId !== this.props.match.params.roomId) {
      this.messagesRef
        .orderByChild("roomId")
        .equalTo(prevProps.match.params.roomId)
        .off();

      this.setState({
        messages: []
      });

      this.messagesRef
        .orderByChild("roomId")
        .equalTo(this.props.match.params.roomId)
        .on("child_added", snapshot => {
          this.updateCreatedMessages(snapshot);
        });
      this.messagesRef
        .orderByChild("roomId")
        .equalTo(this.props.match.params.roomId)
        .on("child_removed", snapshot => {
          this.updateDeletedMessages(snapshot);
        });
      this.messagesRef
        .orderByChild("roomId")
        .equalTo(this.props.match.params.roomId)
        .on("child_changed", snapshot => {
          this.updateEditedMessages(snapshot);
        });
    }

    if(prevProps.deletedRoom !== this.props.deletedRoom){
      this.cleanUpMessages(this.props.deletedRoom);
    }
  }

  updateCreatedMessages(snapshot) {
    const message = snapshot.val();
    message.key = snapshot.key;
    this.setState({
      messages: this.state.messages.concat(message)
    });
  }

  updateDeletedMessages(snapshot) {
    this.setState({
      messages: this.state.messages.filter(
        message => message.key !== snapshot.key
      )
    });
  }

  updateEditedMessages(snapshot) {
    const index = this.state.messages
      .map(message => message.key)
      .indexOf(snapshot.key);
    const editedMessages = [...this.state.messages];
    editedMessages[index].content = snapshot.val().content;
    this.setState({ messages: editedMessages });
  }

  handleInputChange(e) {
    this.setState({
      newMessage: e.target.value
    });
  }

  clearInput() {
    this.setState({
      newMessage: ""
    });
  }

  pushMessage(e) {
    e.preventDefault();
    if (this.state.newMessage) {
      this.messagesRef.push({
        content: this.state.newMessage,
        roomId: this.props.match.params.roomId,
        username: this.props.username,
        sentAt: this.props.firebase.database.ServerValue.TIMESTAMP
      });
      this.clearInput();
    } else {
      alert("This is an empty message!");
    }
  }

  deleteMessage(messageKey) {
    this.messagesRef
      .child(messageKey)
      .remove()
      .then(() => alert("Message deleted"))
      .catch(error => console.log(error));
  }

  editMessage(message) {
    const newContent = prompt("Edit your message", message.content);
    if (newContent === null || newContent === message.content) {
      return;
    } else {
      const newMessage = message;
      newMessage.content = newContent;
      this.messagesRef.child(message.key).set(message);
    }
  }

  cleanUpMessages(room) {
    console.log("Will do", room.name);
    const subscription = this.messagesRef.orderByChild('roomId').equalTo(room.key);

    subscription.on('child_added', snapshot => {
      this.messagesRef.child(snapshot.key).remove()
        .then(() => this.updateDeletedMessages(snapshot))
        .catch(error => console.log(error));
    });
    subscription.off();
  }

  render() {
    return (
      <section className="message-list">
        <h2>{this.props.deletedRoom.name === this.props.match.params.roomName ? "Room unavailable" : this.props.match.params.roomName}</h2>
        <div className="messages">
          {this.state.messages.map((message, index) => (
            <div className="message" key={index}>
              <div>{message.username}</div>
              <div>{message.content}</div>
              <div>{new Date(message.sentAt).toDateString()}</div>
              {this.props.username !== "Guest" ? (
                <div>
                  <button
                    className="icon ion-md-remove-circle"
                    onClick={() => this.deleteMessage(message.key)}
                  />
                  <button
                    className="icon ion-md-create"
                    onClick={() => this.editMessage(message)}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
        <form className="create-message" onSubmit={e => this.pushMessage(e)}>
          <input
            type="text"
            value={this.state.newMessage}
            onChange={e => this.handleInputChange(e)}
          />
          <input type="submit" value="Send" />
        </form>
      </section>
    );
  }
}

export default withRouter(MessageList);
