# Security Considerations

## Signed Installer

- Code-sign all releases with a trusted certificate.
- Publish SHA256 hashes publicly to verify integrity.
- Use HTTPS-only distribution endpoints.
- Verify installer signature before execution in production.

## Network Security

- Proxy app should bind to localhost only (or firewall-restricted IP).
- Use HTTPS for any remote admin panel.
- Rotate admin credentials regularly.
- Log all connections and session starts.

## Player Data

- Store sensitive data (bans, whitelist) in encrypted local files.
- Back up player database daily.
- Implement access controls for admin operations.
- Audit all admin actions.

## Whitelist & Ban Logic

- Whitelist is checked on every connection.
- Bans are checked and enforced server-side.
- Jail zones are validated by the game server.
- Expired bans are cleaned up automatically.

## Recommendations

1. Host the installer on your own domain.
2. Use a code-signing certificate from a trusted CA.
3. Implement rate limiting on the join-code endpoint.
4. Monitor proxy app resource usage.
5. Keep Node.js and dependencies up to date.
6. Regularly audit player access logs.
7. Test the installer on clean Windows systems.
