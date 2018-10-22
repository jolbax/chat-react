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
    this.messagesRef.on("child_added", snapshot => {
      this.updateCreatedMessages(snapshot);
    });
    this.messagesRef.on("child_removed", snapshot => {
      this.updateDeletedMessages(snapshot);
    });
    this.messagesRef.on("child_changed", snapshot => {
      this.updateEditedMessages(snapshot);
    });
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
    this.setState({messages: editedMessages});
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
      return
    } else {
      this.messagesRef.child(message.key).set({ content: newContent });
    }
  }

  render() {
    return (
      <section className="message-list">
        <h2>{this.props.activeRoomName}</h2>
        {this.state.messages
          .filter(message => message.roomId === this.props.match.params.roomId)
          .map((message, index) => (
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
