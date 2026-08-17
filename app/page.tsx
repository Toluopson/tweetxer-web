import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="shell">
      <div className="container">
        <nav className="nav">
          <div className="brand">Tweet<span>Xer</span></div>
          {session.user ? <Link href="/dashboard">Dashboard →</Link> : null}
        </nav>

        <section className="hero">
          <h1>Clean up your X account without sharing your password.</h1>
          <p>
            TweetXer Web is being rebuilt as a secure account-management
            service using X user authorization. Connect your account, choose
            what you want to clean up, and keep your X credentials private.
          </p>

          {session.user ? (
            <Link className="xbutton" href="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <a className="xbutton" href="/api/auth/x/start">
              Continue with X
            </a>
          )}

          <div className="note">
            We only request permissions needed for the cleanup features you use.
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <h2>Delete your posts</h2>
            <p>
              Retrieve your posts and delete posts you authored through the X
              API. Deletion will respect X&apos;s current API rate limits.
            </p>
          </div>
          <div className="card">
            <h2>Manage following</h2>
            <p>
              View accounts you follow and unfollow selected accounts or all
              accounts after a confirmation step.
            </p>
          </div>
        </section>

        <footer className="footer">
          TweetXer Web — early build
        </footer>
      </div>
    </main>
  );
}