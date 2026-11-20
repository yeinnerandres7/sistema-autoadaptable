export default function ProgressBar({ value, label }) {
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="bar__fill" style={{ width: `${value}%` }} />
    </div>
  )
}
