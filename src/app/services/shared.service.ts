import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private clearSubject = new Subject<void>();
  private bokConcept = new BehaviorSubject<string[]>([]);
  private isPdfAvailable = new BehaviorSubject<boolean>(false);

  clear$ = this.clearSubject.asObservable();
  bokConcept$ = this.bokConcept.asObservable();

  setBokConcept(value: string[]) {
    this.bokConcept.next(value);
  }

  getBokConcept(): string[] {
    return this.bokConcept.getValue();
  }

  resetBokConcept() {
    this.bokConcept.next([]);
  }

  getIsPdfAvailable() {
    return this.isPdfAvailable.getValue();
  }

  setIsPdfAvailable(value: boolean) {
    this.isPdfAvailable.next(value);
  }

  triggerClear() {
    this.clearSubject.next();
  }

  constructor() {}
}
