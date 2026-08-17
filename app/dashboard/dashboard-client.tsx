 "use client";

import { useState } from "react";
import type { XUser } from "@/lib/session";

export default function DashboardClient({ user }: { user: XUser }) {
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function deletePosts() {
    const confirmed = window.confirm(
      "Delete your posts through TweetXer? This action cannot be undone."
    );
    if (!confirmed) return;

    setWorking(true);
    setProgress(0);
    setStatus("Loading your posts...");

    try {
      const list = await fetch("/api/posts").then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      });

      const posts = list.data ?? [];
      if (!posts.length) {
        setStatus("No posts were returned by the X API.");
        return;
      }

      let done = 0;
      for (const post of posts) {
        const response = await fetch("/api/posts/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: post.id }),
        });

        if (!response.ok) {
          const text = await response.text();
          setStatus(`Stopped after ${done} posts. ${text}`);
          break;
        }

        done++;
        setProgress(Math.round((done / posts.length) * 100));
        setStatus(`Deleted ${done} of ${posts.length} posts.`);
      }

      if (done === posts.length) setStatus(`Finished. Deleted ${done} posts.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  async function unfollowAll() {
    const confirmed = window.confirm(
      "Unfollow EVERY account returned on the first X API page? This is a destructive action."
    );
    if (!confirmed) return;

    setWorking(true);
    setProgress(0);
    setStatus("Loading your following list...");

    try {
      const list = await fetch("/api/following").then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      });

      const accounts = list.data ?? [];
      if (!accounts.length) {
        setStatus("No following accounts were returned by the X API.");
        return;
      }

      let done = 0;
      for (const account of accounts) {
        const response = await fetch("/api/following/unfollow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: account.id }),
        });

        if (!response.ok) {
          const text = await response.text();
          setStatus(`Stopped after ${done} accounts. ${text}`);
          break;
        }

        done++;
        setProgress(Math.round((done / accounts.length) * 100));
        setStatus(`Unfollowed ${done} of ${accounts.length}.`);
      }

      if (done === accounts.length) setStatus(`Finished. Unfollowed ${done} accounts.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="shell">
      <div className="container">
        <div className="topbar">
          <div className="brand">Tweet<span>Xer</span></div>
          <button className="secondary" onClick={logout}>Disconnect X</button>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="profile">
            {user.profile_image_url ? (
              <img className="avatar" src={user.profile_image_url} alt="" />
            ) : (
              <div className="avatar" />
            )}
            <div>
              <strong>{user.name}</strong>
              <div className="username">@{user.username}</div>
            </div>
          </div>
        </div>

        <div className="warning">
          This is the first web build. X&apos;s official API has substantially
          stricter rate limits than the original browser userscript, so large
          cleanups may take a long time.
        </div>

        <div className="grid">
          <div className="card danger">
            <h2>Delete loaded posts</h2>
            <p>Delete the posts returned by the first X API page for your connected account.</p>
            <button className="primary" disabled={working} onClick={deletePosts}>
              {working ? "Working..." : "Delete posts"}
            </button>
          </div>

          <div className="card danger">
            <h2>Unfollow loaded accounts</h2>
            <p>Unfollow the accounts returned by the first X API page.</p>
            <button className="primary" disabled={working} onClick={unfollowAll}>
              {working ? "Working..." : "Unfollow everyone"}
            </button>
          </div>
        </div>

        {working || status ? (
          <div className="card" style={{ marginTop: 18 }}>
            <strong>Cleanup status</strong>
            <div className="progress">
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="status">{status}</div>
          </div>
        ) : null}
      </div>
    </main>
  );
}