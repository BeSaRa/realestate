import { WebRtcDataContract } from './web-rtc-data-contract';

export interface StreamDataContract {
  id: string;
  webrtcData: WebRtcDataContract;
}
