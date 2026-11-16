/** Your details. The name and what you do are real; the headline, intro, email, location and socials are still placeholders. */
export const site = {
  name: 'Natalia Petrovska',
  initials: 'NP',
  role: 'Art direction',
  /** What you do, in one line. The quiet line of the About headline. */
  statement: 'Art direction. Full-scale art production. AI gen pipeline on demand.',
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
  headline: ['Brand, packaging and print', 'for small companies with big character.'],
  intro:
    'Placeholder introduction. Two or three sentences about what you make, who for, and how you like to work. Replace this in src/data/site.ts.',
  email: 'hello@example.com',
  /** Leave empty until you want it shown; the footer skips it when empty. */
  location: '',
  available: true,
  availability: 'Available for new projects',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Dribbble', href: 'https://dribbble.com/' },
  ],
  /** Shows a thin banner saying the projects are sample content. */
  showSampleNotice: true,
};
