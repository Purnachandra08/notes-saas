import { useState, useEffect } from "react";

export default function Home() {
  const [token, setToken] = useState(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tenant, setTenant] = useState(null);

  const [email, setEmail] = useState("admin@acme.test");
  const [password, setPassword] = useState("password");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (token) {
      fetch("/api/tenants/me", { headers: { Authorization: "Bearer " + token } })
        .then((r) => r.json())
        .then(setTenant)
        .catch(() => setTenant(null));
      fetchNotes();
    }
  }, [token]);

  async function fetchNotes() {
    const res = await fetch("/api/notes", { headers: { Authorization: "Bearer " + token } });
    if (res.ok) setNotes(await res.json());
    else setNotes([]);
  }

  async function login(e) {
    e?.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    } else {
      alert(data.error || "Login failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setNotes([]);
    setTenant(null);
  }

  async function createNote(e) {
    e?.preventDefault();
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setTitle("");
      setContent("");
      fetchNotes();
    } else {
      alert(data.error || "Create failed");
    }
  }

  async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    fetchNotes();
  }

  async function upgrade() {
    const res = await fetch("/api/tenants/upgrade-by-me", { method: "POST", headers: { Authorization: "Bearer " + token } });
    if (res.ok) {
      alert("Upgraded to Pro");
      const t = await (await fetch("/api/tenants/me", { headers: { Authorization: "Bearer " + token } })).json();
      setTenant(t);
    } else {
      alert((await res.json()).error || "Upgrade failed");
    }
  }

  // ======= STYLED COMPONENTS =========
  const container = { padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 700, margin: "auto" };
  const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 };
  const noteBox = { border: "1px solid #ddd", padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: "#f9f9f9" };
  const input = { width: "100%", padding: 8, marginBottom: 8, borderRadius: 4, border: "1px solid #ccc" };
  const button = { padding: "8px 12px", borderRadius: 4, border: "none", backgroundColor: "#0070f3", color: "#fff", cursor: "pointer" };
  const redBox = { marginTop: 20, padding: 10, border: "1px solid #f00", borderRadius: 5, backgroundColor: "#ffe5e5" };

  if (!token) {
    return (
      <div style={container}>
        <h2>Login</h2>
        <form onSubmit={login}>
          <input style={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button style={button}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <strong>{user?.email}</strong> ({user?.role}) — Tenant: {tenant?.name || "—"}
        </div>
        <div>
          <button style={button} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <h3>Create Note</h3>
      <form onSubmit={createNote}>
        <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea style={input} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={4} />
        <button style={button}>Create</button>
      </form>

      <h3>Notes</h3>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {notes.map((n) => (
          <li key={n.id} style={noteBox}>
            <strong>{n.title}</strong>
            <div>{n.content}</div>
            <div>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </div>
            <button style={{ ...button, backgroundColor: "#f00", marginTop: 5 }} onClick={() => deleteNote(n.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {tenant && tenant.plan === "free" && notes.length >= 3 && (
        <div style={redBox}>
          <p>
            <strong>Free plan limit reached (3 notes).</strong> Upgrade to Pro for unlimited notes.
          </p>
          {user?.role === "admin" ? <button style={button} onClick={upgrade}>Upgrade to Pro</button> : <p>Ask an admin to upgrade.</p>}
        </div>
      )}
    </div>
  );
}
