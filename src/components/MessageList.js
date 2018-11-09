import React, { Component } from "react";
import { withRouter } from "react-router-dom";

const Message = (props) => {
  const { message, user, handleDeleteMessage, handleEditMessage } = props;
  return (
    <div className="message">
      <div>{message.username}</div>
      <div>{message.content}</div>
      <div>{Messages.convertTimestamp(message.sentAt)}</div>
      {user ? (
        user.displayName === message.username ? (
          <div>
            <button
              className="icon ion-md-remove-circle"
              onClick={() => handleDeleteMessage(message.key)}
            />
            <button
              className="icon ion-md-create"
              onClick={() => handleEditMessage(message)}
            />
          </div>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </div>
  );
};

class MessagesList extends Component {
  render() {
    const {
      user,
      deletedRoom,
      roomName,
      messages,
      handleDeleteMessage,
      handleEditMessage
    } = this.props;
    return (
      <div className="messages-list">
        <h2>{deletedRoom.name === roomName ? "Room unavailable" : roomName}</h2>
        {messages.map(message => (
          <Message
            key={message.key}
            message={message}
            user={user}
            handleDeleteMessage={message => handleDeleteMessage(message)}
            handleEditMessage={message => handleEditMessage(message)}
          />
        ))}
      </div>
    );
  }
}
class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      message: e.target.value
    });
  }

  clearInput() {
    this.setState({
      message: ""
    });
  }

  render() {
    const { message } = this.state;
    const { handleSubmit } = this.props;
    return (
      <form
        className="create-message"
        onSubmit={e => {
          handleSubmit(e, message);
          this.clearInput();
        }}
      >
        <input type="text" value={message} onChange={this.handleInputChange} />
        <input type="submit" value="Send" />
      </form>
    );
  }
}
class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const node = document.querySelector(".messages-list");
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
      const node = document.querySelector(".messages-list");
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

  pushMessage(e, message) {
    e.preventDefault();
    const { user, match, firebase } = this.props;
    if (message) {
      this.messagesRef.push({
        content: message,
        roomId: match.params.roomId,
        username: user ? user.displayName:"Guest",
        sentAt: firebase.database.ServerValue.TIMESTAMP
      });
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

  static convertTimestamp(timestamp) {
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
    const { user, deletedRoom, match } = this.props;
    const { messages } = this.state;
    return (
      <section className="messages">
        <MessagesList
          user={user}
          deletedRoom={deletedRoom}
          roomName={match.params.roomName}
          messages={messages}
          handleDeleteMessage={message => this.deleteMessage(message)}
          handleEditMessage={message => this.editMessage(message)}
        />
        <MessageForm
          handleSubmit={(e, message) => this.pushMessage(e, message)}
        />
      </section>
    );
  }
}

export default withRouter(Messages);
