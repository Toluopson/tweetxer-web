# TweetXer Web

A starter web app that lets a user connect their X account using OAuth 2.0 Authorization Code with PKCE and manage their own posts/following through X API v2.

## Important

This project intentionally does NOT use the old TweetXer browser-session technique, internal X GraphQL endpoints, or user cookies. The uploaded TweetXer userscript is the reference for desired functionality; the web app uses supported X API endpoints instead.

X's current API documentation lists:
- `DELETE /2/tweets/:id` for deleting a post authored by the authenticated user.
- `GET /2/users/:id/tweets` for a user's posts.
- `GET /2/users/:id/following` for following lists.
- `DELETE /2/users/:source_user_id/following/:target_user_id` for unfollowing.

The starter processes the first API page (up to 100 items) sequentially. Large cleanup jobs need pagination plus a background queue/worker, and all actions must respect X's rate limits.

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.local.example` to `.env.local` and fill in:

```env
X_CLIENT_ID=...
X_CLIENT_SECRET=...
X_REDIRECT_URI=http://localhost:3000/api/auth/x/callback
SESSION_SECRET=...
```

Generate a strong session secret. Do not commit `.env.local`.

## 3. X Developer Console

Configure OAuth 2.0 User Authentication.

Recommended permissions for this MVP:
- Read and write
- Email request: OFF

OAuth 2.0 type:
- Web App, Automated App or Bot

Callback URL:
- `http://localhost:3000/api/auth/x/callback`

When deploying, replace the callback and website URL with your production HTTPS domain.

## 4. Run

```bash
npm run dev
```

Open:

`http://localhost:3000`

## 5. Next production steps

- Move session/token storage from an encrypted cookie to a server-side database.
- Add persistent cleanup jobs with a queue/worker.
- Add pagination for very large accounts.
- Add per-user job history.
- Add CSRF/abuse protections and request auditing.
- Add Privacy Policy and Terms pages.
- Add production domain and HTTPS.
- Add better handling for X token refresh and revoked authorization.
- Add selectable posts/accounts instead of only "delete all" / "unfollow all".
- Add subscription/billing only after the core workflow is stable.
