import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { useTabulationState } from '~/composables/useTabulationState'

const Harness = defineComponent({
  setup() {
    const { lastLeaderboardUpdate, markLeaderboardUpdated } = useTabulationState()
    const updated = lastLeaderboardUpdate('event-1')

    return { updated, markLeaderboardUpdated }
  },
  template: `
    <div>
      <span data-test="updated">{{ updated }}</span>
      <button
        data-test="mark"
        @click="markLeaderboardUpdated('event-1', new Date('2026-01-01T00:00:00.000Z'))"
      >
        Mark updated
      </button>
    </div>
  `,
})

describe('useTabulationState', () => {
  it('starts empty and stores the last leaderboard update', async () => {
    const wrapper = await mountSuspended(Harness)

    expect(wrapper.get('[data-test="updated"]').text()).toBe('')

    await wrapper.get('[data-test="mark"]').trigger('click')

    expect(wrapper.get('[data-test="updated"]').text()).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })
})