import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import LocationPicker from "./LocationPicker.jsx";
import "./MeetupPin.css";

// Same story as everywhere else: the backend serializes this
// struct without json tags, so it comes back as PlaceName,
// ScheduledAt, Confirmations, UserID, Confirmed, etc. Normalize
// once here so the rest of the component can stay snake_case.
const normalizeConfirmation = (raw) => {
  // The backend records a Status string ("confirmed" / "declined" /
  // "pending"), not a boolean flag — there is no Confirmed/confirmed
  // key at all. Checking only for a boolean here meant this always
  // fell through to false, so a successful confirm on the backend
  // never showed up in the UI.
  const status = raw?.status ?? raw?.Status;

  const confirmed =
    raw?.confirmed ??
    raw?.Confirmed ??
    raw?.is_confirmed ??
    (typeof status === "string"
      ? status.toLowerCase() === "confirmed"
      : undefined) ??
    false;

  return {
    user_id:
      raw?.user_id ??
      raw?.UserID ??
      raw?.userId ??
      raw?.participant_id ??
      raw?.ParticipantID ??
      raw?.participant?.user_id ??
      raw?.participant?.id,
    confirmed,
  };
};

const normalizePin = (raw) => {
  if (!raw) return null;

  const confirmations = (
    raw.confirmations ??
    raw.Confirmations ??
    raw.participant_confirmations ??
    raw.ParticipantConfirmations ??
    []
  ).map(normalizeConfirmation);

  return {
    id: raw.id ?? raw.ID ?? raw.pin_id,
    place_name:
      raw.place_name ??
      raw.PlaceName ??
      raw.placeName ??
      "",
    address: raw.address ?? raw.Address ?? "",
    latitude: raw.latitude ?? raw.Latitude ?? null,
    longitude: raw.longitude ?? raw.Longitude ?? null,
    scheduled_at:
      raw.scheduled_at ??
      raw.ScheduledAt ??
      raw.scheduledAt ??
      null,
    confirmations,
  };
};

const getPinId = (pin) => pin?.id;

const getConfirmationUserId = (confirmation) =>
  confirmation?.user_id;

const getConfirmationState = (confirmation) =>
  confirmation?.confirmed ?? false;

const getConfirmationList = (pin) =>
  pin?.confirmations || [];

const getPinSignature = (pin) => {
  if (!pin) return null;

  return JSON.stringify({
    place: pin.place_name || "",
    address: pin.address || "",
    latitude: pin.latitude ?? null,
    longitude: pin.longitude ?? null,
    scheduledAt: pin.scheduled_at || null,
  });
};

export default function MeetupPin({
  hangoutId,
  pin: rawPin,
  isOrganizer,
  currentUserId,
  onPinChanged,
}) {
  const pin = normalizePin(rawPin);

  const [showForm, setShowForm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState("");

  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Confirmations only carry a user_id, no embedded profile.
  const [confirmerProfiles, setConfirmerProfiles] = useState({});

  const [previousSignature, setPreviousSignature] =
    useState(null);

  useEffect(() => {
    const signature = getPinSignature(pin);

    if (!signature) {
      setPreviousSignature(null);
      return;
    }

    if (
      previousSignature &&
      previousSignature !== signature
    ) {
      setChanged(true);
    }

    setPreviousSignature(signature);
  }, [pin]);

  useEffect(() => {
    if (!pin) return;

    setPlaceName(pin.place_name || "");
    setAddress(pin.address || "");

    setLatitude(
      pin.latitude !== undefined &&
      pin.latitude !== null
        ? String(pin.latitude)
        : ""
    );

    setLongitude(
      pin.longitude !== undefined &&
      pin.longitude !== null
        ? String(pin.longitude)
        : ""
    );

    const scheduled = pin.scheduled_at;

    if (scheduled) {
      const date = new Date(scheduled);

      if (!Number.isNaN(date.getTime())) {
        const local = new Date(
          date.getTime() -
            date.getTimezoneOffset() * 60000
        );

        setScheduledAt(
          local.toISOString().slice(0, 16)
        );
      }
    }
  }, [pin]);

  const confirmations =
    getConfirmationList(pin);

  useEffect(() => {
    const ids = [
      ...new Set(
        confirmations
          .map(getConfirmationUserId)
          .filter(Boolean)
      ),
    ];

    const missing = ids.filter(
      (userId) => !confirmerProfiles[userId]
    );

    if (missing.length === 0) return;

    let cancelled = false;

    Promise.all(
      missing.map((userId) =>
        getUserProfile(userId).then(
          (profile) => [userId, profile]
        )
      )
    ).then((pairs) => {
      if (cancelled) return;

      setConfirmerProfiles((previous) => {
        const next = { ...previous };
        pairs.forEach(([userId, profile]) => {
          next[userId] = profile;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [confirmations, confirmerProfiles]);

  const myConfirmation =
    confirmations.find(
      (confirmation) =>
        String(
          getConfirmationUserId(confirmation)
        ) === String(currentUserId)
    );

  const myConfirmed =
    myConfirmation
      ? getConfirmationState(myConfirmation)
      : false;

  const allConfirmed =
    confirmations.length > 0 &&
    confirmations.every(
      getConfirmationState
    );

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      setError("");

      await api.hangouts.respondToMeetupPin(
        hangoutId,
        !myConfirmed
      );

      setChanged(false);

      await onPinChanged?.();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update your confirmation."
      );
    } finally {
      setConfirming(false);
    }
  };

  // Best-effort reverse geocoding: when someone picks a spot on the
  // map and hasn't already typed an address, look one up so they
  // don't have to type it by hand. Free Nominatim endpoint, no key
  // needed. If it fails or is slow, that's fine — lat/lng are
  // already set either way, so saving still works.
  const handleLocationChange = async (lat, lng) => {
    setLatitude(String(lat));
    setLongitude(String(lng));

    if (address.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data?.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      // Reverse geocoding is a convenience, not a requirement.
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!placeName.trim()) {
      setError("Place name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.hangouts.proposeMeetupPin(
        hangoutId,
        {
          place_name: placeName.trim(),
          address: address.trim() || null,
          latitude:
            latitude === ""
              ? 0
              : Number(latitude),
          longitude:
            longitude === ""
              ? 0
              : Number(longitude),
          scheduled_at:
            scheduledAt
              ? new Date(
                  scheduledAt
                ).toISOString()
              : null,
        }
      );

      setShowForm(false);
      setChanged(true);

      await onPinChanged?.();
    } catch (err) {
      setError(
        err.message ||
          "Unable to save meetup pin."
      );
    } finally {
      setSaving(false);
    }
  };

  const openMaps = () => {
    if (!pin) return;

    const { latitude, longitude } = pin;

    let query;

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      Number(latitude) !== 0 &&
      Number(longitude) !== 0
    ) {
      query = `${latitude},${longitude}`;
    } else {
      query = [pin.place_name || "", pin.address || ""]
        .filter(Boolean)
        .join(", ");
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="meetup-pin">
      <div className="meetup-pin__header">
        <h2>Meetup Pin</h2>

        {isOrganizer && (
          <button
            type="button"
            onClick={() =>
              setShowForm((value) => !value)
            }
          >
            {pin ? "Edit Pin" : "Set Meetup Pin"}
          </button>
        )}
      </div>

      {error && (
        <div className="meetup-pin__error">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="meetup-pin__form"
          onSubmit={handleSave}
        >
          <label>
            Place name
            <input
              value={placeName}
              onChange={(event) =>
                setPlaceName(event.target.value)
              }
              placeholder="Mellat Park"
              required
            />
          </label>

          <label>
            Address
            <input
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Tehran, Iran"
            />
          </label>

          <label>
            Meetup location
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationChange}
            />
          </label>

          <p className="meetup-pin__map-hint">
            Click anywhere on the map to drop a pin, or drag
            the marker to fine-tune it.
          </p>

          {latitude !== "" && longitude !== "" && (
            <p className="meetup-pin__coords">
              Selected: {Number(latitude).toFixed(5)},{" "}
              {Number(longitude).toFixed(5)}
            </p>
          )}

          <label>
            Meetup time
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(event.target.value)
              }
            />
          </label>

          <div className="meetup-pin__form-actions">
            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : pin
                ? "Update Pin"
                : "Create Pin"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          {pin && (
            <p>
              Updating the meetup pin will reset
              participant confirmations.
            </p>
          )}
        </form>
      )}

      {!pin && !showForm && (
        <div className="meetup-pin__empty">
          <p>
            No meetup location has been chosen yet.
          </p>

          {isOrganizer && (
            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
            >
              Choose Meetup Location
            </button>
          )}
        </div>
      )}

      {pin && !showForm && (
        <div className="meetup-pin__content">
          {changed && (
            <div className="meetup-pin__changed">
              The meetup details changed.
              Please review and confirm the new
              location and time.
            </div>
          )}

          <h3>
            {pin.place_name || "Meetup Location"}
          </h3>

          {pin.address && (
            <p>{pin.address}</p>
          )}

          {pin.scheduled_at && (
            <p>
              {new Date(
                pin.scheduled_at
              ).toLocaleString()}
            </p>
          )}

          <button
            type="button"
            onClick={openMaps}
          >
            Open in Maps
          </button>

          <button
            type="button"
            disabled={confirming}
            onClick={handleConfirm}
          >
            {confirming
              ? "Updating..."
              : myConfirmed
              ? "Change My Confirmation"
              : "Confirm Meetup"}
          </button>

          {allConfirmed && (
            <p className="meetup-pin__all-confirmed">
              Everyone has confirmed the meetup.
            </p>
          )}

          {confirmations.length > 0 && (
            <div className="meetup-pin__confirmations">
              <h4>Confirmations</h4>

              {confirmations.map(
                (confirmation, index) => {
                  const userId =
                    getConfirmationUserId(
                      confirmation
                    );

                  const confirmed =
                    getConfirmationState(
                      confirmation
                    );

                  const name =
                    confirmerProfiles[userId]
                      ?.display_name ||
                    confirmerProfiles[userId]
                      ?.handle ||
                    `Participant ${index + 1}`;

                  return (
                    <div
                      key={
                        userId || index
                      }
                    >
                      <span>{name}</span>

                      <span
                        className={`meetup-pin__confirmation-status ${
                          confirmed ? "confirmed" : "waiting"
                        }`}
                      >
                        {confirmed
                          ? "Confirmed"
                          : "Waiting"}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}