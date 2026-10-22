export const CINE_FRAME_COUNT = 169;

export const cineFramePath = (n: number) =>
  `/frames2/frame_${String(n).padStart(4, "0")}.jpg`;

export type Beat = {
  id: string;
  show: number;
  hide: number;
  label: string;
  quote: string;
  speaker: string;
  film: string;
};

export const BEATS: Beat[] = [
  {
    id: "b1",
    show: 0.1,
    hide: 0.3,
    label: "01 — Ignição",
    quote: "É, eu posso voar.",
    speaker: "Tony Stark",
    film: "HOMEM DE FERRO — 2008",
  },
  {
    id: "b2",
    show: 0.35,
    hide: 0.55,
    label: "02 — Sincronização",
    quote: "A armadura e eu somos um só.",
    speaker: "Tony Stark",
    film: "HOMEM DE FERRO 3 — 2013",
  },
  {
    id: "b3",
    show: 0.6,
    hide: 0.8,
    label: "03 — Consequências",
    quote: "Não se trata de quanto perdemos. Trata-se de quanto ainda nos resta.",
    speaker: "Tony Stark",
    film: "VINGADORES: ULTIMATO — 2019",
  },
];

export const CINE_INTRO_FADE_END = 0.08;
