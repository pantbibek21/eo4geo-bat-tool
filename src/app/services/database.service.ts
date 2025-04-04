import { inject, Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { collection, CollectionReference, Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

    private auth = inject(Auth);
    private db = inject(Firestore);
    private storage = inject(Storage)

    private docsCollection: CollectionReference;

    constructor() { 
        this.docsCollection = collection(this.db, 'Other');
    }

}