import { IceServerContract } from './ice-server-contract';
import { OfferContract } from './offer-contract';

export interface WebRtcDataContract {
  iceServers: IceServerContract[];
  offer: OfferContract;
}
