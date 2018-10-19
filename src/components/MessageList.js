import React, { Component } from "react";
import { withRouter } from "react-router-dom";
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

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.roomId !== this.props.match.params.roomId) {
      this.messagesRef = this.props.firebase.database().ref("messages");
      this.updateMessages();
      console.log("should be empty", this.state.messages);
    }
  }

  componentWillUnmount() {
    // Detach database reference listener
    this.subscription.off();
  }

  updateMessages() {
    this.setState({ messages: [] });
    this.subscription = this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId)
      .on("child_added", snapshot => {
        const message = snapshot.val();
        message.key = snapshot.key;
        this.setState({
          messages: this.state.messages.concat(message)
        });
        console.log("fetching:", this.state.messages);
      });
    console.log("should be full", this.state.messages);
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
export default withRouter(MessageList);
