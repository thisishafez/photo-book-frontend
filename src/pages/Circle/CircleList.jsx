import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FindFriendsModal from "../../components/FindFriendsModal/FindFriendsModal";
import Navbar from "../../components/Navbar/Navbar";
import FriendCard from "../../components/FriendCard/FriendCard";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getUserProfile } from "../../utils/userCache";
import "./CircleList.css";

export default function CircleList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadCircle(); }, []);

  const loadCircle = async () => {
    setIsLoading(true);
    try {
      const connections = await api.circle.getCircle();
      const enriched = await Promise.all(
        connections.map(async (conn) => {
          const otherId = conn.RequesterID === user.id ? conn.AddresseeID : conn.RequesterID;
          const profile = await getUserProfile(otherId);
          return {
            connectionId: conn.ID,
            userId: otherId,
            displayName: profile.display_name,
            handle: profile.handle,
          };
        })
      );
      setFriends(enriched);
    } catch (error) {
      console.error("[Circle] Failed to load circle", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async (connectionId) => {
    await api.circle.severConnection(connectionId);
    setFriends(prev => prev.filter(f => f.connectionId !== connectionId));
  };

  return (
    <div className={`circle-page ${darkMode ? "kh-dark" : ""}`}>
      <Navbar />
      <main className="circle-container">
        <button className="home-btn" onClick={() => navigate("/")}>← Home</button>
        <h1>My Circle</h1>
        <button className="find-friends-btn" onClick={() => setShowFindFriends(true)}>
          Find Friends
        </button>

        {isLoading ? (
          <p>Loading...</p>
        ) : friends.length === 0 ? (
          <p>No connections yet. Find some friends!</p>
        ) : (
          friends.map(friend => (
            <FriendCard key={friend.connectionId} friend={friend} onRemove={removeFriend} />
          ))
        )}

        {showFindFriends && (
          <FindFriendsModal close={() => setShowFindFriends(false)} />
        )}
      </main>
    </div>
  );
}