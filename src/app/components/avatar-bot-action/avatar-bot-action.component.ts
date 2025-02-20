import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { BaseBotActionDirective } from '@directives/base-bot-action.directive';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AvatarService } from '@services/avatar.service';
import { StreamService } from '@services/stream.service';
import { catchError, finalize, from, map, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-avatar-bot-action',
  standalone: true,
  imports: [CommonModule, CustomTooltipDirective, CdkDrag, CdkDragHandle],
  templateUrl: './avatar-bot-action.component.html',
  styleUrl: './avatar-bot-action.component.scss',
})
export class AvatarBotActionComponent extends OnDestroyMixin(BaseBotActionDirective) implements OnDestroy {
  video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  avatarService = inject(AvatarService);
  streamService = inject(StreamService);

  rtcPC?: RTCPeerConnection;
  isOpened = signal(false);

  private _streamStatus = signal<'started' | 'stopped' | 'disconnecting' | 'loading'>('stopped');

  isStarted = computed(() => this._streamStatus() === 'started');
  isStopped = computed(() => this._streamStatus() === 'stopped');
  isPaused = computed(() => this._streamStatus() === 'loading');
  isDisconnecting = computed(() => this._streamStatus() === 'disconnecting');

  toggleAvatar() {
    this.isOpened.set(!this.isOpened());
    this.isOpened() ? this.startAvatar() : this.stopAvatar();
  }

  startAvatar() {
    this._pause();
    this.avatarService
      .startStream()
      .pipe(
        catchError((err) => {
          this._stop();
          return throwError(() => err);
        })
      )
      .subscribe((res) => {
        this.streamService.updateStreamResult(res);
        this._initPC();
      });
  }

  stopAvatar() {
    this._disconnect();
    this.avatarService
      .closeStream()
      .pipe(finalize(() => this._stop()))
      .subscribe(() => {
        this.streamService.updateStreamResult();
      });
  }

  interruptAvatar() {
    this.avatarService.interruptAvatar().subscribe();
  }

  private _start() {
    this._streamStatus.set('started');
  }

  private _stop() {
    this._streamStatus.set('stopped');
  }

  private _pause() {
    this._streamStatus.set('loading');
  }

  private _disconnect() {
    this._streamStatus.set('disconnecting');
  }

  private _initPC() {
    this.rtcPC = new RTCPeerConnection({
      iceServers: this.streamService.streamResult()!.data.webrtcData.iceServers,
      iceTransportPolicy: 'relay',
    });

    this.rtcPC!.onicecandidate = this._listenToIceCandidate;
    this.rtcPC!.onicegatheringstatechange = this._listenToIceGatheringStateChange;
    this.rtcPC!.onconnectionstatechange = this._listenToConnectionStateChange;
    this.rtcPC!.ontrack = this._listenToTrack;

    from(
      this.rtcPC.setRemoteDescription(
        new RTCSessionDescription(
          this.streamService.streamResult()!.data.webrtcData.offer as unknown as RTCSessionDescriptionInit
        )
      )
    )
      .pipe(
        switchMap(() => from(this.rtcPC!.createAnswer())),
        switchMap((answer) => from(this.rtcPC!.setLocalDescription(answer)).pipe(map(() => answer))),
        switchMap((answer) => this.avatarService.sendAnswer(answer))
      )
      .subscribe();
  }

  private _listenToIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    event.candidate && this.avatarService.sendCandidate(event.candidate).subscribe();
  };

  private _listenToIceGatheringStateChange = (event: Event) => {
    if (
      (event.target as unknown as RTCPeerConnection).iceGatheringState == 'complete' &&
      this.video().nativeElement.paused
    ) {
      this.video().nativeElement.play();
      this._start();
    }
  };

  private _listenToConnectionStateChange = (event: Event) => {
    const connectionState = (event.target as unknown as RTCPeerConnection).connectionState;
    if (connectionState === 'connected') {
      this._start();
    }
    if (connectionState === 'disconnected') {
      this._stop();
    }
  };

  private _listenToTrack = (event: RTCTrackEvent) => {
    this.video().nativeElement.srcObject = event.streams[0];
  };

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.stopAvatar();
  }
}
