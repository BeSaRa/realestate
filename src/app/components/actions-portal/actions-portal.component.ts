import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Directive, Injectable, Input, OnDestroy, TemplateRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
class ActionsService {
  private _actions: { template: TemplateRef<any>; order: number }[] = [];
  private actionsSubject = new BehaviorSubject<{ template: TemplateRef<any>; order: number }[]>([]);
  actions$ = this.actionsSubject.asObservable();

  addAction(action: { template: TemplateRef<any>; order: number }) {
    this._actions.push(action);
    this._actions.sort((a, b) => a.order - b.order);
    this.actionsSubject.next(this._actions);
  }

  removeAction(actionTemplate: TemplateRef<any>) {
    this._actions = this._actions.filter((action) => action.template !== actionTemplate);
    this.actionsSubject.next(this._actions);
  }
}

@Directive({
  selector: 'ng-template[appAction]',
  standalone: true,
})
export class ActionDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) appActionActionOrder = 0;
  private _actionsService = inject(ActionsService);

  templateRef = inject(TemplateRef);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._actionsService.addAction({ template: this.templateRef, order: this.appActionActionOrder });
    }, 0);
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this._actionsService.removeAction(this.templateRef);
    }, 0);
  }
}

@Component({
  selector: 'app-actions-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-portal.component.html',
  styleUrl: './actions-portal.component.scss',
})
export class ActionsPortalComponent {
  actionsService = inject(ActionsService);
}
