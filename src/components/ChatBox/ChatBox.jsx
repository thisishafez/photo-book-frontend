import { useState } from "react";

import "./ChatBox.css";


export default function ChatBox(){

  const [message,setMessage] =
    useState("");


  const [messages,setMessages] =
    useState([
      {
        id:1,
        user:"Ali",
        text:"Where should we meet?"
      },
      {
        id:2,
        user:"Sara",
        text:"Park entrance works for me."
      }
    ]);


  const sendMessage = ()=>{

    if(!message.trim()){
      return;
    }


    setMessages(prev => [
      ...prev,
      {
        id:Date.now(),
        user:"You",
        text:message,
        mine:true
      }
    ]);


    setMessage("");

  };


  return (

    <section className="chat-box">

      <div className="chat-header">

        <h2>
          Hangout Chat
        </h2>

      </div>


      <div className="chat-messages">

        {messages.map(item => (

          <div
            key={item.id}
            className={
              `chat-message ${
                item.mine ? "mine" : ""
              }`
            }
          >

            <span className="chat-message-user">
              {item.user}
            </span>

            {item.text}

          </div>

        ))}

      </div>


      <div className="chat-input-area">

        <input
          value={message}
          onChange={
            e=>setMessage(e.target.value)
          }
          onKeyDown={
            e=>{
              if(e.key === "Enter"){
                sendMessage();
              }
            }
          }
          placeholder="Write a message..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </section>

  );
}