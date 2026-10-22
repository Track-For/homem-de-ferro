export const FRAME_COUNT = 169;

export const framePath = (n: number) =>
  `/frames/frame_${String(n).padStart(4, "0")}.jpg`;

export type Dialogue = {
  id: string;
  show: number;
  hide: number;
  quote: string;
  speaker: string;
  film: string;
};

export const DIALOGUES: Dialogue[] = [
  {
    id: "d1",
    show: 0.1,
    hide: 0.3,
    quote: "Às vezes, é preciso correr antes de aprender a andar.",
    speaker: "Tony Stark",
    film: "HOMEM DE FERRO — 2008",
  },
  {
    id: "d2",
    show: 0.35,
    hide: 0.55,
    quote: "Gênio. Bilionário. Playboy. Filantropo.",
    speaker: "Tony Stark",
    film: "OS VINGADORES — 2012",
  },
  {
    id: "d3",
    show: 0.6,
    hide: 0.8,
    quote: "Parte da jornada é o fim.",
    speaker: "Tony Stark",
    film: "VINGADORES: ULTIMATO — 2019",
  },
];

export const HERO_TEXT_FADE_END = 0.08;
