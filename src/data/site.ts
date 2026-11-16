/** Your details. The name and what you do are real; the email and socials are still placeholders. */
export const site = {
  name: 'Natalia Petrovska',
  initials: 'NP',
  role: 'Art direction',
  /** What you can help with. Shown in the About section. */
  services: [
    {
      name: 'Art direction',
      text: 'Developing a style for your game that meets the expectations of your target audience and stands out among competitors.',
    },
    {
      name: 'AI production',
      text: 'Implementing AI pipelines for the needs of your studio’s creative process, with proven results in reducing cost and time.',
    },
    {
      name: 'UI/UX design',
      text: 'Taking your ideas from wireframes to the end product, delivering high-quality assets, style guides, component libraries and more.',
    },
    {
      name: 'Mentoring',
      text: 'Mentoring and coaching junior and mid-level artists, helping them navigate career progression and find satisfaction in day-to-day life.',
    },
  ],
  /** What you do, as the home headline: an ink line, then a quieter one. */
  // "full‑scale" uses a non-breaking hyphen so the word never splits across two lines
  headline: ['Art direction and full‑scale art production,', 'with an AI gen pipeline on demand.'],
  intro:
    'I help game studios with art direction, AI production, UI/UX design and mentoring.',
  email: 'hello@example.com',
  available: true,
  availability: 'Available for new projects',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/natka/' },
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Dribbble', href: 'https://dribbble.com/' },
  ],
  /** Shows a thin banner saying the projects are sample content. */
  showSampleNotice: true,
};
