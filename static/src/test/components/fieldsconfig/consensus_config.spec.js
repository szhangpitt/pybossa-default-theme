import Vuex from 'vuex';
import { mount, createLocalVue } from '@vue/test-utils';
import ConsensusConfig from '../../../components/fieldsconfig/consensus_config.vue';
import { storeSpecs } from '../../../components/fieldsconfig/store';

// import { storeSpecs } from '../../../components/fieldsconfig/store';
import { cloneDeep } from 'lodash';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('ConsensusConfig', () => {
  let store;
  let fetch;
  let notify;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeSpecs));
    fetch = global.fetch = jest.fn();
    notify = window.pybossaNotify = jest.fn();
  });

  it('does not load data', () => {
    store.commit('setData', {
      answerFields: {
        testField: {
          type: 'categorical',
          config: {
            labels: ['A', 'B', 'C']
          },
          retryForConsensus: false
        }
      },
      consensus: { }
    });
    const wrapper = mount(ConsensusConfig, { store, localVue });
    const p = wrapper.findAll('p');
    expect(p).toHaveLength(0);
  });

  it('loads empty config', () => {
    store.commit('setData', {
      answerFields: {
        testField: {
          type: 'categorical',
          config: {
            labels: ['A', 'B', 'C']
          },
          retry_for_consensus: true
        }
      },
      consensus: { }
    });
    const wrapper = mount(ConsensusConfig, { store, localVue });
    const p = wrapper.findAll('p').at(3);
    expect(p.text()).toEqual('No consensus currently configured.');
  });

  it('load non-empty config', () => {
    const propsData = {
      consensusConfig: { consensusThreshold: 70, maxRetries: 10, redundancyConfig: 1 }
    };
    store.commit('setData', {
      answerFields: {
        testField: {
          type: 'categorical',
          config: {
            labels: ['A', 'B', 'C']
          },
          retry_for_consensus: true
        }
      },
      consensus: {
        consensus_threshold: 70,
        max_retries: 10,
        redundancy_config: 1
      }
    });
    const wrapper = mount(ConsensusConfig, { store, localVue, propsData });
    const p = wrapper.findAll('p');
    const button = wrapper.findAll('button');
    expect(button).toHaveLength(2);
    expect(p).toHaveLength(9);
  });

  it('saves config', async () => {
    fetch.mockImplementation((arg) => ({
      ok: true,
      json: () => Promise.resolve({ flash: 'hello', status: 'success' })
    }));
    store.commit('setData', {
      answerFields: {
        testField: {
          type: 'categorical',
          config: {
            labels: ['A', 'B', 'C']
          },
          retry_for_consensus: true
        }
      }
    });
    const wrapper = mount(ConsensusConfig, { store, localVue });
    wrapper.setData({ consensusThreshold: 80, maxRetries: 15, redundancyConfig: 3 });
    const saveButton = wrapper.findAll('button').at(0);
    saveButton.trigger('click');
    await localVue.nextTick();
    expect(fetch.mock.calls).toHaveLength(1);
    expect(notify.mock.calls).toHaveLength(1);
    const [ msg, dismissable, status ] = notify.mock.calls[0];
    expect(msg).toBe('hello');
    expect(dismissable).toBe(true);
    expect(status).toBe('success');
  });

  it('delete config', async () => {
    fetch.mockImplementation((arg) => ({
      ok: true,
      json: () => Promise.resolve({ flash: 'hello', status: 'success' })
    }));
    const propsData = {
      consensusConfig: { consensusThreshold: 70, maxRetries: 10, redundancyConfig: 1 }
    };
    store.commit('setData', {
      answerFields: {
        testField: {
          type: 'categorical',
          config: {
            labels: ['A', 'B', 'C']
          },
          retry_for_consensus: true
        }
      },
      consensus: {
        consensus_threshold: 70,
        max_retries: 10,
        redundancy_config: 1
      }
    });
    const wrapper = mount(ConsensusConfig, { store, localVue, propsData });
    const deleteButton = wrapper.findAll('button').at(1);
    deleteButton.trigger('click');
    await localVue.nextTick();
    expect(fetch.mock.calls).toHaveLength(1);
    expect(notify.mock.calls).toHaveLength(1);
    const [ msg, dismissable, status ] = notify.mock.calls[0];
    expect(msg).toBe('hello');
    expect(dismissable).toBe(true);
    expect(status).toBe('success');
  });
});
