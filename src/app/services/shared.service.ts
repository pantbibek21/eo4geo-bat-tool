import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private clearSubject = new Subject<void>(); // used to clear form fields and progress
  private bokConcept = new BehaviorSubject<string[]>([]); // holds the BoK relations
  private isPdfAvailable = new BehaviorSubject<boolean>(false); // boolean to add dynamic classes later to enable buttons

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
