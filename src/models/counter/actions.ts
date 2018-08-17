import { ActionResult, ActionsType } from 'hyperapp'
import { State } from './state'

export interface Actions {
  down: (value: number) => (state: State) => ActionResult<State>
  up: (value: number) => (state: State) => ActionResult<State>
}

export const actions: ActionsType<State, Actions> = {
  down: (value: number) => (state) => {
    return {
      count: state.count - value
    }
  },
  up: (value: number) => (state) => {
    return {
      count: state.count + value
    }
  }
}
