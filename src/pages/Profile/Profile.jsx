import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import BadgeCard from "../../components/BadgeCard/BadgeCard";
import ActivityHistory from "../../components/ActivityHistory/ActivityHistory";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { hangoutToHistoryItem } from "../../utils/normalizeProfile";
import "./Profile.css";

export default function Profile() {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const accountType = user?.accountType || "user";

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [interests, setInterests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [accountType]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      if (accountType === "host") {
        setProfile(await api.host.getProfile());
      } else if (accountType === "moderator") {
        setProfile(await api.moderator.getProfile());
      } else {
        const [profileData, badgeData, interestData, hangoutData] = await Promise.all([
          api.user.getProfile(),
          api.badges.getBadges(),
          api.user.getInterests(),
          api.hangouts.getHangouts("completed"),
        ]);
        setProfile(profileData);
        setBadges(badgeData);
        setInterests(interestData || []);
        setHistory((hangoutData || []).map(hangoutToHistoryItem));
      }
    } catch (err) {
      // A fresh account that hasn't completed profile setup yet will
      // 404 here rather than error — treat that as "no profile" so
      // the page can point them at setup instead of showing an error.
      if (err.status === 404) {
        setProfile(null);
      } else {
        setError(err.message || "Couldn't load your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBadge = async (id) => {
    const updated = await api.badges.toggleVisibility(id);
    setBadges((previous) => previous.map((badge) => (badge.id === id ? updated : badge)));
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="profile-loading">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar />
        <div className="profile-loading">
          You haven't finished setting up your profile yet.
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page ${darkMode ? "profile-dark" : ""}`}>
      <Navbar />
      <main className="profile-container">
        {accountType === "host" && <HostProfileView profile={profile} onLogout={logout} />}
        {accountType === "moderator" && <ModeratorProfileView profile={profile} onLogout={logout} />}
        {accountType === "user" && (
          <UserProfileView
            profile={profile}
            badges={badges}
            interests={interests}
            history={history}
            onToggleBadge={toggleBadge}
            onLogout={logout}
          />
        )}
      </main>
    </div>
  );
}

function UserProfileView({ profile, badges, interests, history, onToggleBadge, onLogout }) {
  return (
    <>
      <section className="profile-header">
        <div className="profile-avatar">
          {profile.avatar ? <img src={profile.avatar} alt="" /> : profile.displayName.charAt(0)}
        </div>
        <div>
          <h1>{profile.displayName}</h1>
          <p>{profile.handle}</p>
          <p className="bio">{profile.bio}</p>
          <button className="profile-logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </section>

      <section className="profile-section">
        <h2>Enjoyed</h2>
        <div className="badges">
          {badges.length === 0 ? (
            <p className="profile-empty">No badges yet — scan a QR code at an activity to earn one.</p>
          ) : (
            badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} onToggle={onToggleBadge} />
            ))
          )}
        </div>
      </section>

      <section className="profile-section">
        <h2>Interests</h2>
        <div className="interest-list">
          {interests.length === 0 ? (
            <p className="profile-empty">No interests selected yet.</p>
          ) : (
            interests.map((interest) => {
              const label =
                typeof interest === "string"
                  ? interest
                  : interest.name || interest.Name || interest.label || interest.id;
              return <span key={label}>{label}</span>;
            })
          )}
        </div>
      </section>

      <section className="profile-section">
        <h2>History</h2>
        <ActivityHistory history={history} />
      </section>
    </>
  );
}

function HostProfileView({ profile, onLogout }) {
  return (
    <>
      <section className="profile-header">
        <div className="profile-avatar">{profile.businessName.charAt(0)}</div>
        <div>
          <h1>{profile.businessName}</h1>
          {profile.locationInfo && <p className="bio">{profile.locationInfo}</p>}
          <button className="profile-logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </section>

      <section className="profile-section">
        <h2>Manage activities</h2>
        <p className="profile-empty">
          Set up badges and QR check-in codes for your activities from the Host Dashboard.
        </p>
        <a className="profile-cta" href="/host/dashboard">Go to Host Dashboard →</a>
      </section>
    </>
  );
}

function ModeratorProfileView({ profile, onLogout }) {
  return (
    <>
      <section className="profile-header">
        <div className="profile-avatar">M</div>
        <div>
          <h1>Moderator</h1>
          {profile.createdAt && (
            <p className="bio">Moderating since {new Date(profile.createdAt).toLocaleDateString()}</p>
          )}
          <button className="profile-logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </section>

      <section className="profile-section">
        <h2>Moderation queues</h2>
        <div className="profile-cta-row">
          <a className="profile-cta" href="/moderation/activities">Activity queue →</a>
          <a className="profile-cta" href="/moderation/comments">Comment queue →</a>
        </div>
      </section>
    </>
  );
}