import './App.css';
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from 'react';

function App() {
  const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    pincode: '',
  });

  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated && user) {
        const initial = {
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          email: user.email || '',
          phone: '',
          city: '',
          pincode: ''
        };
        setProfile(initial);

        try {
          const res = await fetch(`http://localhost:4000/users/email/${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setUserExists(true);
            setProfile(data.user); // populate form with saved values
          } else {
            // Create if not found
            await fetch(`http://localhost:4000/users/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(initial)
            });
            setUserExists(true);
          }
        } catch (err) {
          console.error("Failed to sync user:", err);
        }
      }
    };

    init();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const url = userExists
        ? 'http://localhost:4000/users/update-by-email'
        : 'http://localhost:4000/users/create';

      const body = userExists
        ? { email: profile.email, updatedUser: profile }
        : profile;

      const method = userExists ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("Saved!");
        setUserExists(true);
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  return (
     <div className="App">
      <h1>Platformatory Labs</h1>
      {isAuthenticated ? (
        <>
          <img className="avatar" src={profile.picture} alt="avatar" />
          <h3>Welcome, {profile.firstName} {profile.lastName}</h3>
          <p>{profile.email}</p>

          <form className="profile-form">
            <input name="firstName" value={profile.firstName} onChange={handleChange} placeholder="First Name" />
            <input name="lastName" value={profile.lastName} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={profile.email} readOnly />
            <input name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
            <input name="city" value={profile.city} onChange={handleChange} placeholder="City" />
            <input name="pincode" value={profile.pincode} onChange={handleChange} placeholder="Pincode" />
            <button type="button" onClick={handleSave}>Save</button>
          </form>

          <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
        </>
      ) : (
        <button className="login-button" onClick={() => loginWithRedirect()}>Login</button>
      )}
    </div>
  );
}

export default App;
