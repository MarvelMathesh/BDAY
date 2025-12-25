import { Vector3 } from "three";

export const CAKE_START_Y = 10;
export const CAKE_END_Y = 0;
export const CAKE_DESCENT_DURATION = 3;

export const TABLE_START_Z = 30;
export const TABLE_END_Z = 0;
export const TABLE_SLIDE_DURATION = 0.7;
export const TABLE_SLIDE_START = CAKE_DESCENT_DURATION - TABLE_SLIDE_DURATION - 0.1;

export const CANDLE_START_Y = 5;
export const CANDLE_END_Y = 0;
export const CANDLE_DROP_DURATION = 1.2;
export const CANDLE_DROP_START =
    Math.max(CAKE_DESCENT_DURATION, TABLE_SLIDE_START + TABLE_SLIDE_DURATION) +
    1.0;

export const TOTAL_ANIMATION_TIME = CANDLE_DROP_START + CANDLE_DROP_DURATION;

export const ORBIT_TARGET = new Vector3(0, 1, 0);

export const ORBIT_INITIAL_RADIUS = 3;
export const ORBIT_INITIAL_HEIGHT = 1;
export const ORBIT_INITIAL_AZIMUTH = Math.PI / 2;
export const ORBIT_MIN_DISTANCE = 2;
export const ORBIT_MAX_DISTANCE = 8;
export const ORBIT_MIN_POLAR = Math.PI * 0;
export const ORBIT_MAX_POLAR = Math.PI / 2;

export const BACKGROUND_FADE_DURATION = 1;
export const BACKGROUND_FADE_START = Math.max(
    Math.max(CANDLE_DROP_START, BACKGROUND_FADE_DURATION),
    0
);

export type BirthdayCardConfig = {
    id: string;
    image: string;
    position: [number, number, number];
    rotation: [number, number, number];
};

export const BIRTHDAY_CARDS: ReadonlyArray<BirthdayCardConfig> = [
    {
        id: "confetti",
        image: "/card.png",
        position: [1, 0.081, -2],
        rotation: [-Math.PI / 2, 0, Math.PI / 3],
    }
];
