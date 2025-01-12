import { computed, Injectable, signal } from '@angular/core';
import { StreamResultContract } from '@contracts/stream-result-contract';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private _streamId = signal('');
  private _streamResult = signal<undefined | StreamResultContract>(undefined);
  private _isFrozen = signal(false);

  streamId = computed(() => (this._isFrozen() ? '' : this._streamId()));
  streamResult = computed(() => this._streamResult());

  updateStreamId(id: string) {
    this._streamId.set(id);
  }

  updateStreamResult(streamResult?: StreamResultContract) {
    this._streamResult.set(streamResult);
  }

  freezeStream() {
    this._isFrozen.set(true);
  }

  unFreezeStream() {
    this._isFrozen.set(false);
  }
}
