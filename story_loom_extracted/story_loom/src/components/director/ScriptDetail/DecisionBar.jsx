export default function DecisionBar({ onDecide }) {
  return (
    <>
      <div className="decision-bar">
        <button className="btn-approve" onClick={() => onDecide('Approved for funding')}>✓ Approve for funding</button>
      </div>
      <div className="decision-bar">
        <button className="btn-revise" style={{ flex: 1 }} onClick={() => onDecide('Sent back for revision')}>Request revision</button>
        <button className="btn-reject" onClick={() => onDecide('Rejected')}>Reject</button>
      </div>
    </>
  );
}
