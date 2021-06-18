import { Sheet } from "models/Sheet";

export type CounterState = {
  count: number;
};

export type SheetState = {
  sheet: Sheet | null;
};

export type State = {
  counter: CounterState;
  sheet: SheetState;
};
