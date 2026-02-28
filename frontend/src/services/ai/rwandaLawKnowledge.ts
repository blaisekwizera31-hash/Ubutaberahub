/**
 * Lightweight Rwanda law knowledge fallback.
 * This module is intentionally compact and syntactically safe.
 */

export const RWANDA_LAW_KNOWLEDGE = {
  general: {
    en: "Rwandan law covers constitutional rights, criminal law, family law, property law, labor law, and business law.",
    rw: "Amategeko y'u Rwanda akubiyemo uburenganzira bw'ibanze, amategeko mpanabyaha, ay'umuryango, ay'umutungo, ay'akazi n'ay'ubucuruzi.",
    fr: "Le droit rwandais couvre les droits constitutionnels, le droit pénal, familial, foncier, du travail et des affaires.",
  },
  rights: {
    en: [
      "Right to legal counsel",
      "Right to fair hearing",
      "Right to humane treatment",
      "Right to be informed of charges",
    ],
    rw: [
      "Uburenganzira bwo kubona umwunganizi",
      "Uburenganzira bwo kuburana mu mucyo",
      "Uburenganzira bwo gufatwa neza",
      "Uburenganzira bwo kumenyeshwa ibyo ushinjwa",
    ],
    fr: [
      "Droit à un avocat",
      "Droit à une audience équitable",
      "Droit à un traitement humain",
      "Droit d'être informé des charges",
    ],
  },
} as const;

