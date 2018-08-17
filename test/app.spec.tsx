import { app, h, View } from 'hyperapp'
import { actions, Actions } from '@app/models/counter/actions'
import { state, State } from '@app/models/counter/state'
import { view } from '@components/counter'
import { doesNotReject } from 'assert'

test('state is defined', () => {
  expect(state).toBeDefined()
})

test('actions is defined', () => {
  expect(actions).toBeDefined()
})
