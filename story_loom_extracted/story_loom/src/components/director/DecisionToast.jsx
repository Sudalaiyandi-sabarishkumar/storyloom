export default function DecisionToast({ message, show }) {
  return (
    <div className={`decision-toast ${show ? 'show' : ''}`}>{message}</div>
  );
}
