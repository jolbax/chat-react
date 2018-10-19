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
    this.updateMessages();
  }

  updateMessages() {
    this.messagesRef.on("child_added", snapshot => {
      const message = snapshot.val();
      message.key = snapshot.key;
      this.setState({
        messages: this.state.messages.concat(message)
      });
    });
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

  render() {
    return (
      <section className="message-list">
        <h2>{this.props.currentChatRoomName}</h2>
        {this.state.messages
          .filter(message => message.roomId === this.props.match.params.roomId)
          .map((message, index) => (
            <div className="message" key={index}>
              <div>{message.username}</div>
              <div>{message.content}</div>
              <div>{new Date(message.sentAt).toDateString()}</div>
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
