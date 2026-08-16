# PropNexus inquiry email alerts

PropNexus sends the primary inquiry notification through the built-in owner notification channel. It also supports an optional server-only SMTP fallback for a second alert when a visitor submits an inquiry. The fallback is non-blocking: database persistence and the primary owner alert remain successful even when SMTP is disabled or unavailable.

## Free Gmail setup

A Gmail account can be used without a paid email service. Enable two-step verification on the sending Gmail account, create a Google app password, and use that 16-character app password as `SMTP_PASS`. Do not use the normal Gmail account password.

Configure the following server environment variables through the project’s Secrets settings:

| Variable | Required for email | Purpose |
|---|---:|---|
| `SMTP_HOST` | No | SMTP server hostname; defaults to `smtp.gmail.com`. |
| `SMTP_PORT` | No | SMTP port; defaults to `465` with TLS. |
| `SMTP_USER` | Yes | Gmail address used to send the alert. |
| `SMTP_PASS` | Yes | Gmail app password, not the normal account password. |
| `OWNER_ALERT_EMAIL` | Yes | Recipient address for secondary inquiry alerts. |

When all three values `SMTP_USER`, `SMTP_PASS`, and `OWNER_ALERT_EMAIL` are present, the server sends a plain-text email containing the property ID, visitor name, phone, email, and message. If any value is missing, the fallback remains disabled and the inquiry still persists normally. SMTP errors are logged server-side without exposing credentials or blocking the visitor’s submission.

The recipient should be the owner’s verified mailbox. The currently supplied contact address is `rawalabhaya!@gmail.com`; verify the exact mailbox spelling before entering it because Gmail addresses commonly do not accept punctuation such as `!` in the local part.
