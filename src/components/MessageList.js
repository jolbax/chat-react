import React, { Component } from "react";

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    this.messagesRef = this.props.firebase.database().ref("messages");
  }

  componentDidMount() {
      this.updateMessages();
  }

  updateMessages() {
    this.messagesRef
      .on("child_added", snapshot => {
        const message = snapshot.val();
        message.key = snapshot.key;
        this.setState({
          messages: this.state.messages.concat(message)
        });
      });
  }

  render() {
    return (
      <section className="message-list">
        <h2>{this.props.currentChatRoomName}</h2>
        {this.state.messages
        .filter(message => message.roomId === this.props.currentChatRoomId)
        .map((message, index) => (
          <div className="message" key={index}>
            <div>{message.username}</div>
            <div>{message.content}</div>
            <div>{message.sentAt}</div>
          </div>
        ))}
      </section>
    );
  }
}

export default MessageList;
