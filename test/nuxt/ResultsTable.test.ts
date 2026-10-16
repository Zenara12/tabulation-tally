import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResultsTable from '~/components/ResultsTable.vue'

describe('ResultsTable', () => {
  it('renders the contestant and weighted total', () => {
    const wrapper = mount(ResultsTable, {
      props: {
        mode: 'total',
        criterias: [
          { criteriaId: 'presentation', criteriaName: 'Presentation', weight: 60 },
        ],
        rows: [
          {
            rank: 1,
            complete: true,
            weightedTotal: 89.5,
            contestant: {
              id: 'contestant-1',
              alias: 'Ada',
              name: 'Ada Lovelace',
              characterName: 'The Analyst',
              cosplayPictureUrl: null,
            },
            criteriaBreakdown: [
              {
                criteriaId: 'presentation',
                average: 89.5,
                weighted: 53.7,
                score: null,
              },
            ],
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Ada')
    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('89.50')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })

  it('shows an em dash when optional contestant data is missing', () => {
    const wrapper = mount(ResultsTable, {
      props: {
        mode: 'total',
        criterias: [],
        rows: [{
          rank: 2,
          complete: false,
          weightedTotal: 0,
          contestant: {
            id: 'contestant-2',
            alias: null,
            name: 'Unnamed contestant',
            characterName: null,
            cosplayPictureUrl: null,
          },
          criteriaBreakdown: [],
        }],
      },
    })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.find('tbody tr').classes()).toContain('opacity-60')
  })
})
