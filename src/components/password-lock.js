import React, { useState } from 'react';
import styles from '../styles/password-lock.module.css';

export function PasswordLock({ handleCorrectPassword }) {
  const [password, setPassword] = useState('');

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        async function checkPassword(password) {
          const { allowed } = await fetch('/.netlify/functions/check-secret', {
            method: 'POST',
            body: JSON.stringify({ password }),
          }).then((response) => response.json());

          if (!allowed) {
            setPassword('');
            return;
          }

          handleCorrectPassword();
        }

        const data = new FormData(event.target);
        const password = data.get('password');

        checkPassword(password);
      }}
    >
      <label htmlFor="exclusivePassword" className={styles.label}>
        What's the password?
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="exclusivePassword"
          name="password"
        />
      </label>
      <button type="submit" className={styles.button}>
        Unlock
      </button>
    </form>
  );
}
