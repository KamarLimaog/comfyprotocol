type Props = {
  step?: string;
  message?: string;
  error?: string;
};

export function TxStatus({ step, message, error }: Props) {
  if (!step && !message && !error) return null;
  return (
    <div className={`txStatus ${error ? "err" : ""}`}>
      <div className="txTitle">{error ? "Error" : step || "Status"}</div>
      <div className="txMsg">{error || message}</div>
    </div>
  );
}

