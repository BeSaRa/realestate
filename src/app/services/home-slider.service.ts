import { CmsService } from '@abstracts/cms.service';
import { Injectable } from '@angular/core';
import { HomeSlider } from '@models/home-slider';
import { CastResponseContainer } from 'cast-response';

CastResponseContainer({
  $default: {
    model: () => HomeSlider,
  },
});
@Injectable({
  providedIn: 'root',
})
export class HomeSliderService extends CmsService<HomeSlider> {
  serviceName = 'HomeSliderService';
  collectionName = 'home_slider';
}
