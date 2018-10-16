import React, { Component } from "react";

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    this.messagesRef = this.props.firebase.database().ref("messages");
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentChatRoomId !== prevProps.currentChatRoomId) {
      this.setState({message: []});
      this.updateMessages(this.props.currentChatRoomId);
    }
  }

  updateMessages(chatRoomId) {
    this.messagesRef
      .orderByChild("roomId")
      .equalTo(chatRoomId)
      .on("child_added", snapshot => {
        const message = snapshot.val();
        message.key = snapshot.key;
        console.log(snapshot);
        this.setState({
          messages: this.state.messages.concat(message)
        });
      });
  }

  render() {
    return (
      <section className="message-list">
        <h2>{this.props.currentChatRoomName}</h2>
        {this.state.messages.map((message, index) => (
          <div key={index}>
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
