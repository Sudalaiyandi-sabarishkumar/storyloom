/** Purely decorative — layered image/glow/vignette behind the login/signup card. */
export default function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <div className="auth-backdrop-image" />
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="auth-orb auth-orb-c" />
      <div className="auth-backdrop-vignette" />
    </div>
  );
}
