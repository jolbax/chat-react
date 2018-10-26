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
    this.subscription = this.messagesRef
      .orderByChild("roomId")
      .equalTo(this.props.match.params.roomId);

    this.subscription.on("child_added", snapshot => {
      this.updateCreatedMessages(snapshot);
    });
    this.subscription.on("child_removed", snapshot => {
      this.updateDeletedMessages(snapshot);
    });
    this.subscription.on("child_changed", snapshot => {
      this.updateEditedMessages(snapshot);
    });
  }

  componentWillUpdate() {
    const node = document.querySelector(".messages");
    this.shouldScrollToButton =
      node.scrollTop + node.clientHeight + 100 >= node.scrollHeight;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.roomId !== this.props.match.params.roomId) {
      this.subscription.off();

      this.setState({
        messages: []
      });

      this.subscription = this.messagesRef
        .orderByChild("roomId")
        .equalTo(this.props.match.params.roomId);

      this.subscription.on("child_added", snapshot => {
        this.updateCreatedMessages(snapshot);
      });
      this.subscription.on("child_removed", snapshot => {
        this.updateDeletedMessages(snapshot);
      });
      this.subscription.on("child_changed", snapshot => {
        this.updateEditedMessages(snapshot);
      });
    }

    if (prevProps.deletedRoom !== this.props.deletedRoom) {
      this.cleanUpMessages(this.props.deletedRoom);
    }

    // Grab the rendered message list and scroll to the bottom
    if (this.shouldScrollToButton) {
      const node = document.querySelector(".messages");
      node.scrollTop = node.scrollHeight;
    }
  }

  componentWillUnmount() {
    this.subscription.off();
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
    const subscription = this.messagesRef
      .orderByChild("roomId")
      .equalTo(room.key);

    subscription.on("child_added", snapshot => {
      this.messagesRef
        .child(snapshot.key)
        .remove()
        .then(() => this.updateDeletedMessages(snapshot))
        .catch(error => console.log(error));
    });
    subscription.off();
  }

  convertTimestamp(timestamp) {
    let getMonth = date => ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero based. Add leading 0.
    let getDay = date => ("0" + date.getDate()).slice(-2); // Add leading 0.

    let today = new Date(Date.now()),
      yesterday = (d => new Date(d.setDate(d.getDate() - 1)))(new Date()),
      d = new Date(timestamp),
      yyyy = d.getFullYear(),
      mm = getMonth(d),
      dd = getDay(d),
      hh = d.getHours(),
      h = hh,
      min = ("0" + d.getMinutes()).slice(-2), // Add leading 0.
      ampm = "AM",
      time;

    if (hh > 12) {
      h = hh - 12;
      ampm = "PM";
    } else if (hh === 12) {
      h = 12;
      ampm = "PM";
    } else if (hh === 0) {
      h = 12;
    }

    if (
      yyyy === today.getFullYear() &&
      mm === getMonth(today) &&
      dd === getDay(today)
    ) {
      time = `Today, ${h}:${min} ${ampm}`;
    } else if (
      yyyy === yesterday.getFullYear() &&
      mm === getMonth(yesterday) &&
      dd === getDay(yesterday)
    ) {
      time = `Yesterday, ${h}:${min} ${ampm}`;
    } else {
      time = `${yyyy}-${mm}-${dd}, ${h}:${min} ${ampm}`;
    }

    return time;
  }

  render() {
    return (
      <section className="message-list">
        <h2>
          {this.props.deletedRoom.name === this.props.match.params.roomName
            ? "Room unavailable"
            : this.props.match.params.roomName}
        </h2>
        <div className="messages">
          {this.state.messages.map((message, index) => (
            <div className="message" key={index}>
              <div>{message.username}</div>
              <div>{message.content}</div>
              <div>{this.convertTimestamp(message.sentAt)}</div>
              {this.props.username !== "Guest" ? (
                this.props.username === message.username ? (
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
                )
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
