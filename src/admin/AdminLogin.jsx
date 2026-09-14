import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

function AdminLogin({ onLogin }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/admin_login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      onLogin(data.admin);

      navigate("/admin");

    } catch (err) {

      setError(
        err.message ||
          "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-logo">
          <ShieldCheck size={38} />
        </div>

        <div className="admin-login-header">
          <h1>Admin Portal</h1>

          <p>
            Sign in to manage community
            environmental reports.
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-login-field">

            <label htmlFor="username">
              Username
            </label>

            <div className="admin-input-wrapper">
              <User size={19} />

              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                autoComplete="username"
              />
            </div>

          </div>

          <div className="admin-login-field">

            <label htmlFor="password">
              Password
            </label>

            <div className="admin-input-wrapper">
              <Lock size={19} />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <LoaderCircle
                  size={19}
                  className="spin"
                />

                Signing in...
              </>
            ) : (
              <>
                <ShieldCheck size={19} />

                Sign In
              </>
            )}

          </button>

        </form>

        <div className="admin-login-footer">
          <span>
            SmartReport
          </span>

          <span>
            Municipal Administration Portal
          </span>
        </div>

      </div>

    </div>
  );
}

export default AdminLogin;
