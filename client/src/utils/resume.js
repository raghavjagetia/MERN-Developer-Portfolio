import { certifications, education, experience, profile, skillGroups } from '../data/data.js';

export function downloadResume() {
  const lines = [
    profile.name.toUpperCase(), profile.role, `${profile.email} · ${profile.location}`, '',
    'SUMMARY', profile.summary, '',
    'EXPERIENCE',
    ...experience.flatMap((e) => [`${e.role} — ${e.org} (${e.period})`, ...e.points.map((p) => `  • ${p}`), '']),
    'EDUCATION', ...education.map((e) => `${e.role} — ${e.org} (${e.period})`), '',
    'SKILLS', ...skillGroups.map((g) => `${g.category}: ${g.skills.map((s) => s.name).join(', ')}`), '',
    'CERTIFICATIONS', ...certifications.map((c) => `${c.title} — ${c.issuer} (${c.year})`),
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${profile.name.replace(/\s+/g, '_')}_Resume.txt` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Opens the browser print dialog showing only the resume, so it can be saved as PDF.
export function printResume() {
  document.body.classList.add('printing-resume');
  const done = () => { document.body.classList.remove('printing-resume'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
