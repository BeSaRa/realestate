import { Directive, ElementRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appTextWritingAnimator]',
  standalone: true,
})
export class TextWritingAnimatorDirective implements OnInit {
  @Input() text = '';
  @Input() speed = 2;
  @Input() stop = false;
  @Input() passAnimation = false;
  @Output() isAnimating: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.animateText();
  }

  animateText() {
    this.isAnimating.emit(true);
    let index = 0;
    let currentText = '';

    const addNextCharacter = () => {
      if (this.stop) {
        this.isAnimating.emit(false);
        return;
      }
      if (this.passAnimation) {
        currentText += this.text.slice(index);
        this._elementRef.nativeElement.innerHTML = currentText;
        return;
      }
      currentText += this.text.charAt(index);
      this._elementRef.nativeElement.innerHTML = currentText; // Render current text
      // chatContainer.scrollTop = chatContainer.scrollHeight;
      index++;
      if (index < this.text.length) {
        setTimeout(addNextCharacter, this.speed * Math.random()); // Adjust speed here (milliseconds)
      } else {
        this.isAnimating.emit(false);
      }
    };
    addNextCharacter();
  }
}
