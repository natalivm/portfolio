/**
 * The UX laws page (/ux-laws/): 100 laws and principles of design psychology, in ten groups.
 *
 * The list and its grouping follow the Ukrainian collection “100 законів психології дизайну”.
 * The write-ups here are original English summaries, not a translation of that text, and each
 * law's Do / Don't example is drawn in HTML in src/components/ux/examples/<slug>.astro.
 *
 * - summary: the law in one or two sentences.
 * - apply:   how to use it in an interface, three or four short points.
 * - good / bad: the caption under each example.
 */

export interface UxSection {
  id: string;
  /** Full name, for the section heading */
  name: string;
  /** Short name, for the filter chip */
  short: string;
  blurb: string;
}

export interface UxLaw {
  slug: string;
  name: string;
  section: string;
  summary: string;
  apply: string[];
  good: string;
  bad: string;
}

export const sections: UxSection[] = [
  {
    id: 'cognition',
    name: 'Foundations of cognitive interaction',
    short: 'Cognition',
    blurb: 'Simplify information, lighten the load on the brain, and make interaction feel obvious.',
  },
];

export const laws: UxLaw[] = [
  {
    slug: 'cognitive-load',
    name: 'Cognitive load',
    section: 'cognition',
    summary:
      'Working memory holds only a little at once. Ask people to juggle more than that and they slow down, tire, and make mistakes.',
    apply: [
      'Split long forms into short steps and show where the person is.',
      'Group related fields and controls so they are read as one unit.',
      'Show the five or six table columns people need; move the rest into a details view.',
      'Lean on patterns people already know instead of inventing new ones.',
    ],
    good: 'Checkout in three steps: two fields at a time, and a stepper that shows what is left.',
    bad: 'Fifteen required fields on one screen, with nothing to say which ones matter first.',
  },
];
