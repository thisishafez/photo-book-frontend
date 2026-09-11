import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import "./ChatBox.css";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id || user?.user_id || user?.account_id || null;
  } catch {
    return null;
  }
};

const getMessageId = (message) =>
  message?.id ||
  message?.ID ||
  `${getSenderId(message)}-${getCreatedAt(message)}-${getContent(message)}`;

const getSenderId = (message) =>
  message?.sender_id ||
  message?.SenderID ||
  message?.senderId ||
  message?.sender?.id ||
  message?.sender?.user_id;

const getContent = (message) => message?.content ?? message?.Content ?? "";

const getCreatedAt = (message) =>
  message?.created_at || message?.CreatedAt || message?.createdAt || null;

const normalizeMessages = (response) => {
  if (Array.isArray(response)) return response;
  return response?.messages || response?.items || response?.data || [];
};

const mergeMessages = (previous, incoming) => {
  const map = new Map();

  [...previous, ...incoming].forEach((message) => {
    map.set(getMessageId(message), message);
  });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(getCreatedAt(a) || 0).getTime();
    const bTime = new Date(getCreatedAt(b) || 0).getTime();
    return aTime - bTime;
  });
};

export default function ChatBox({ hangoutId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  // Messages only carry a sender_id, no embedded profile, so we
  // resolve display names the same way participants/friends do.
  const [senderProfiles, setSenderProfiles] = useState({});

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const ids = [...new Set(messages.map(getSenderId).filter(Boolean))];
    const missing = ids.filter((senderId) => !senderProfiles[senderId]);

    if (missing.length === 0) return;

    let cancelled = false;

    Promise.all(
      missing.map((senderId) =>
        getUserProfile(senderId).then((profile) => [senderId, profile])
      )
    ).then((pairs) => {
      if (cancelled) return;

      setSenderProfiles((previous) => {
        const next = { ...previous };
        pairs.forEach(([senderId, profile]) => {
          next[senderId] = profile;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [messages, senderProfiles]);

  const getSenderName = (message, isMine) => {
    if (isMine) return "You";

    const profile = senderProfiles[getSenderId(message)];

    return profile?.display_name || profile?.handle || "Participant";
  };

  // One-off REST fetch. Used for the initial load, and as a fallback
  // when the WebSocket handshake fails — the browser doesn't expose
  // *why* a socket failed to connect, but this endpoint returns a
  // real 401/403/404 we can show the user.
  const loadMessages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const response = await api.hangouts.getMessages(hangoutId, {
        limit: 50,
      });

      const incoming = normalizeMessages(response);
      setMessages((previous) => mergeMessages(previous, incoming));
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load messages.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const connectSocket = useCallback(() => {
    if (!hangoutId) return;

    const url = api.hangouts.getChatSocketUrl(hangoutId);

    intentionalCloseRef.current = false;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const incoming = JSON.parse(event.data);
        setMessages((previous) => mergeMessages(previous, [incoming]));
      } catch {
        // Ignore malformed frames rather than crash the chat.
      }
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;

      if (intentionalCloseRef.current) return;

      // First failure after a working connection (or on initial mount):
      // surface a real error via REST, since WS gives us none.
      if (reconnectAttemptsRef.current === 0) {
        loadMessages(false);
      }

      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;

      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * 2 ** (attempt - 1),
        RECONNECT_MAX_DELAY_MS
      );

      reconnectTimerRef.current = setTimeout(connectSocket, delay);
    };

    socket.onerror = () => {
      // onclose fires right after; reconnect/backoff lives there.
    };
  }, [hangoutId]);

  useEffect(() => {
    if (!hangoutId) return;

    loadMessages(true);
    connectSocket();

    return () => {
      intentionalCloseRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [hangoutId, connectSocket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await api.hangouts.sendMessage(hangoutId, trimmed);
      const sentMessage = response?.message || response?.data || response;

      // This also arrives back over the socket broadcast a moment later;
      // mergeMessages dedupes by ID so it won't double up.
      setMessages((previous) => mergeMessages(previous, [sentMessage]));
      setContent("");
    } catch (err) {
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="hangout-chat">
      <div className="hangout-chat__header">
        <h2>Group Chat</h2>
        {!connected && !loading && (
          <span className="hangout-chat__status">Reconnecting…</span>
        )}
      </div>

      <div className="hangout-chat__messages">
        {loading && <p>Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p>No messages yet. Start the conversation.</p>
        )}

        {messages.map((message) => {
          const senderId = getSenderId(message);
          const isMine =
            currentUserId &&
            senderId &&
            String(currentUserId) === String(senderId);

          return (
            <div
              key={getMessageId(message)}
              className={`chat-message ${
                isMine ? "chat-message--mine" : ""
              }`}
            >
              <div className="chat-message__sender">
                {getSenderName(message, isMine)}
              </div>

              <div className="chat-message__content">
                {getContent(message)}
              </div>

              {getCreatedAt(message) && (
                <div className="chat-message__time">
                  {new Date(getCreatedAt(message)).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {error && <div className="hangout-chat__error">{error}</div>}

      <form className="hangout-chat__form" onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          disabled={sending}
        />

        <button type="submit" disabled={sending || !content.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}