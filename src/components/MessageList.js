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
    this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId)
      .on("child_added", snapshot => this.updateMessages(snapshot));
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
        .on("child_added", snapshot => this.updateMessages(snapshot));
    }
  }

  componentWillUnmount() {
    this.messagesRef.off();
  }

  updateMessages(snapshot) {
    console.log(snapshot.val());
    const message = snapshot.val();
    message.key = snapshot.key;
    this.setState({
      messages: this.state.messages.concat(message)
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
export default withRouter(MessageList);
