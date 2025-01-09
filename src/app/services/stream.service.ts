import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private _streamId = signal('');
  streamId = computed(() => this._streamId());

  updateStreamId(id: string) {
    this._streamId.set(id);
  }
}
