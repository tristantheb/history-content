import React, { useState } from 'react';

/**
 * Affiche le badge SVG généré pour une page et une locale donnée.
 * @param {Object} props
 * @param {string} props.lang - La locale (ex: 'fr', 'es', ...)
 * @param {string} props.slug - Le nom du badge (ex: 'web_html_index')
 */
export default function StatusSVG({ lang = 'fr', slug = 'web_html_index' }) {
  const [error, setError] = useState(false);
  const badgeSrc = `/public/badges/${lang}/${slug}.svg`;

  return (
    <div>
      {error ? (
        <div style={{ color: '#e11d48', fontWeight: 'bold' }}>
          Badge introuvable pour <code>{slug}</code> ({lang})
        </div>
      ) : (
        <img
          src={badgeSrc}
          alt={`Status badge for ${slug} (${lang})`}
          style={{ maxWidth: 480, height: 'auto' }}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
