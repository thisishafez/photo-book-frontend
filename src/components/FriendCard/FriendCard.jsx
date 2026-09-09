import "./FriendCard.css";

export default function FriendCard({ friend, onRemove }) {
  return (
    <div className="friend-card">
      <div>
        <h3>{friend.displayName || friend.handle}</h3>
        <p>@{friend.handle}</p>
      </div>
      <button onClick={() => onRemove(friend.connectionId)}>Remove</button>
    </div>
  );
}