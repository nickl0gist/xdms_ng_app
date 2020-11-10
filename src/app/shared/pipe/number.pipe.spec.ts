import { NumberFormatPipe } from './number-format.pipe';

describe('NumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberFormatPipe();
    expect(pipe).toBeTruthy();
  });
});
