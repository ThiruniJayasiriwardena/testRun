"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Op = "+" | "−" | "×" | "÷";

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

function format(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  return String(parseFloat(n.toPrecision(12)));
}

function Btn({
  label,
  onClick,
  kind = "num",
  wide = false,
  active = false,
}: {
  label: string;
  onClick: () => void;
  kind?: "num" | "op" | "fn";
  wide?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[kind]} ${wide ? styles.wide : ""} ${
        active ? styles.active : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true); // next digit starts a new number
  const [history, setHistory] = useState<string[]>([]);

  const reset = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const digit = (d: string) => {
    if (display === "Error") return reset();
    setDisplay(fresh || display === "0" ? d : display + d);
    setFresh(false);
  };

  const dot = () => {
    if (fresh || display === "Error") {
      setDisplay("0.");
      setFresh(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const chooseOp = (next: Op) => {
    if (display === "Error") return;
    const cur = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const result = compute(prev, cur, op);
      setPrev(result);
      setDisplay(format(result));
    } else {
      setPrev(cur);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (prev === null || !op || display === "Error") return;
    const cur = parseFloat(display);
    const result = compute(prev, cur, op);
    const out = format(result);
    setHistory((h) =>
      [`${format(prev)} ${op} ${format(cur)} = ${out}`, ...h].slice(0, 5),
    );
    setDisplay(out);
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const negate = () => {
    if (display === "Error" || display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  };

  const percent = () => {
    if (display === "Error") return;
    setDisplay(format(parseFloat(display) / 100));
    setFresh(true);
  };

  const backspace = () => {
    if (fresh || display === "Error") return;
    const next = display.slice(0, -1);
    setDisplay(next === "" || next === "-" ? "0" : next);
  };

  // Keyboard support (re-subscribed each render so handlers see fresh state)
  useEffect(() => {
    const opKeys: Record<string, Op> = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (/^[0-9]$/.test(e.key)) digit(e.key);
      else if (e.key === ".") dot();
      else if (e.key in opKeys) {
        e.preventDefault(); // avoid browser quick-find on "/"
        chooseOp(opKeys[e.key]);
      } else if (e.key === "%") percent();
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault(); // don't also click a focused button
        equals();
      } else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape" || e.key === "Delete") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const opBtn = (label: Op) => (
    <Btn
      label={label}
      onClick={() => chooseOp(label)}
      kind="op"
      active={op === label && fresh}
    />
  );

  return (
    <div className={styles.calc}>
      <div className={styles.screen}>
        <div className={styles.expr}>
          {prev !== null && op ? `${format(prev)} ${op}` : " "}
        </div>
        <div className={styles.value} data-testid="display">
          {display}
        </div>
      </div>

      <div className={styles.keys}>
        <Btn label="AC" onClick={reset} kind="fn" />
        <Btn label="±" onClick={negate} kind="fn" />
        <Btn label="%" onClick={percent} kind="fn" />
        {opBtn("÷")}

        {["7", "8", "9"].map((d) => (
          <Btn key={d} label={d} onClick={() => digit(d)} />
        ))}
        {opBtn("×")}

        {["4", "5", "6"].map((d) => (
          <Btn key={d} label={d} onClick={() => digit(d)} />
        ))}
        {opBtn("−")}

        {["1", "2", "3"].map((d) => (
          <Btn key={d} label={d} onClick={() => digit(d)} />
        ))}
        {opBtn("+")}

        <Btn label="0" onClick={() => digit("0")} wide />
        <Btn label="." onClick={dot} />
        <Btn label="=" onClick={equals} kind="op" />
      </div>

      <div className={styles.bottom}>
        <button type="button" className={styles.link} onClick={backspace}>
          ⌫ Backspace
        </button>
        {history.length > 0 && (
          <>
            <ul className={styles.history}>
              {history.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.link}
              onClick={() => setHistory([])}
            >
              Clear history
            </button>
          </>
        )}
      </div>
    </div>
  );
}
