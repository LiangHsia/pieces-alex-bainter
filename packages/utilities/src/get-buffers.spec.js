/*eslint-env mocha*/
import expect from 'chai/interface/expect';
import Tone from 'tone';
import getBuffers from './get-buffers';

describe('getBuffers', () => {
  it('should return a promise that resolves to an instance of Tone.Buffers', () => {
    const stringUrl = './base/test-assets/noise-1s.ogg';
    const audioBufferUrl = Tone.context.createBuffer(1, 44100, 44100);
    const urlMaps = [
      [stringUrl],
      {
        note: stringUrl,
      },
      [audioBufferUrl],
      {
        note: audioBufferUrl,
      },
    ];
    const results = urlMaps.map(urlMap => getBuffers(urlMap));
    results.forEach(result => {
      expect(result).to.be.an.instanceOf(Promise);
    });
    return Promise.all(results).then(resolvedResults => {
      resolvedResults.forEach(result => {
        expect(result).to.be.an.instanceOf(Tone.Buffers);
      });
    });
  });
});
