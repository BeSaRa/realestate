import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StreamResultContract } from '@contracts/stream-result-contract';
import { Observable, of, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { StreamService } from './stream.service';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private readonly _configService = inject(ConfigService);
  private readonly _http = inject(HttpClient);
  private readonly _streamService = inject(StreamService);
  private _avatarUrl = this._configService.CONFIG.AUTHORITY_AI.BASE_URL + '/avatar';

  startStream() {
    return this._http
      .post<StreamResultContract>(this._avatarUrl + '/start-stream', {})
      .pipe(tap((res) => this._streamService.updateStreamId(res.data.id)));
  }

  closeStream() {
    if (!this._streamService.streamId()) return of();
    return this._http
      .delete<StreamResultContract>(this._avatarUrl + `/close-stream/${this._streamService.streamId()}`)
      .pipe(tap(() => this._streamService.updateStreamId('')));
  }

  sendCandidate(candidate: RTCIceCandidate) {
    return this._http.post<StreamResultContract>(
      this._avatarUrl + `/send-candidate/${this._streamService.streamId()}`,
      {
        candidate,
      }
    );
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    return this._http.put<StreamResultContract>(this._avatarUrl + `/send-answer/${this._streamService.streamId()}`, {
      answer,
    });
  }

  interruptAvatar() {
    if (!this._streamService.streamId()) return of();
    return this._http.delete<StreamResultContract>(this._avatarUrl + `/stop-render/${this._streamService.streamId()}`);
  }

  renderText(): Observable<unknown> {
    return this._http.post(this._avatarUrl + `/render-text/${this._streamService.streamId()}`, {});
  }
}
