
const DEFAULT_SIZE = 99999;

export class IdGenRoundCounter {
  num: number;
  size: number;

  constructor(size: number = DEFAULT_SIZE) {
    this.num = Math.round(Math.random() * size);
    this.size = size;
  }

  take(): number {
    if (this.num === this.size) {
      this.num = 0;
    }
    return ++this.num;
  }
}
