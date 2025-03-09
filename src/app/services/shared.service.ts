import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private clearSubject = new Subject<void>();
  private bokConcept = new BehaviorSubject<string>('');

  clear$ = this.clearSubject.asObservable();
  bokConcept$ = this.bokConcept.asObservable();

  setBokConcept(value: string) {
    this.bokConcept.next(value);
  }

  triggerClear() {
    this.clearSubject.next();
  }

  constructor() {}
}
