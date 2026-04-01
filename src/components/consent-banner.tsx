"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "somitex-consent-banner-choice";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="consent-banner" role="dialog" aria-label="Einwilligungs-Hinweis">
      <div>
        <strong>Datenschutz-Hinweis</strong>
        <p>Optionale Analyse- oder Komfortfunktionen duerfen erst nach dokumentierter Einwilligung aktiviert werden.</p>
      </div>
      <div className="consent-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "declined");
            setVisible(false);
          }}
        >
          Ablehnen
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "granted");
            setVisible(false);
          }}
        >
          Einwilligen
        </button>
      </div>
    </div>
  );
}
