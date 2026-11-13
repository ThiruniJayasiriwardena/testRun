import Calculator from "./Calculator";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Calculator thiruni</h1>
      <Calculator />
    </main>
  );
}
