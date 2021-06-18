import produce from "immer";
import { action, ActionType } from "typesafe-actions";
import { CounterState } from "modules/State";
import inistialState from "./initialState";

export const INC_COUNT = "@COUNTER/INC_COUNT";
export const DEC_COUNT = "@COUNTER/DEC_COUNT";

export const increaseCount = (count: number) => action(INC_COUNT, { count });
type IncCount = ActionType<typeof increaseCount>;

export const decreaseCount = (count: number) => action(DEC_COUNT, { count });
type DecCount = ActionType<typeof decreaseCount>;

export type CounterActions = IncCount | DecCount;

export const counterReducer = (
  state: CounterState = inistialState.counter,
  action: CounterActions
): CounterState => {
  switch (action.type) {
    case INC_COUNT: {
      const { payload } = action as IncCount;
      return produce<CounterState>(state, (draft) => {
        draft.count = state.count + payload.count;
      });
    }
    case DEC_COUNT: {
      const { payload } = action as DecCount;
      return produce<CounterState>(state, (draft) => {
        draft.count = state.count - payload.count;
      });
    }
    default:
      return state;
  }
};
