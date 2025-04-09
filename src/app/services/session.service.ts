import { inject, Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {

    private auth;
    
    private logged: BehaviorSubject<boolean> = new BehaviorSubject(false);
    logged$: Observable<boolean> = this.logged.asObservable()

    private userUid: BehaviorSubject<string> = new BehaviorSubject('');
    userUid$: Observable<string> = this.userUid.asObservable();

    constructor() { 
        this.auth = inject(Auth);
        authState(this.auth).subscribe(user => {
            this.logged.next(!!user);
            this.userUid.next(this.auth.currentUser?.uid ?? '')
        });
    }

}