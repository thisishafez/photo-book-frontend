const API_BASE_URL = "https://yadegar-api.duster.ir";

export const api = {
  auth: {
    register: async (username, email, password) => {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Registration failed"
        );
      }

      return data;
    },

    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Login failed"
        );
      }

      return data;
    },

    logout: async () => {
      // No logout endpoint exists on the backend.
      // Logging out is handled by clearing local storage.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};