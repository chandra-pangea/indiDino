// Minus/plus control that reports the new quantity when changed.
import styles from './QuantityStepper.module.css';

interface QuantityStepperProps {
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

// Renders decrement/value/increment buttons, clamped to the minimum.
export function QuantityStepper({ value, min = 0, onChange }: QuantityStepperProps) {
  return (
    <div className={styles.stepper}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease quantity">
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
