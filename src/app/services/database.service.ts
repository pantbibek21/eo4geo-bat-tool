import { inject, Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { collection, CollectionReference, doc, docData, DocumentReference, Firestore, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { catchError, concatMap, first, forkJoin, from, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { AnnotatedDocument } from '../model/annotatedDocument';
import { PDFDocument } from 'pdf-lib';
import { DocumentForm } from '../model/documentForm';
import { SessionService } from './session.service';
import { BokInformationService } from '@eo4geo/ngx-bok-visualization';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  private auth = inject(Auth);
  private db = inject(Firestore);
  private storage = inject(Storage)

  private docsCollection: CollectionReference;
  private orgCollection: CollectionReference;
  private userCollection: CollectionReference;

  private userId: string = '';

  constructor(private sessionService: SessionService, private bokInfoService: BokInformationService) { 
    this.docsCollection = collection(this.db, 'Other');
    this.orgCollection = collection(this.db, 'Organizations');
    this.userCollection = collection(this.db, 'Users');

    this.sessionService.userUid$.subscribe(uid => this.userId = uid);
  }

  getUserOrganizations(): Observable<{ _id: string, name: string }[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const userDocRef: DocumentReference = doc(this.userCollection, user.uid);
          return docData(userDocRef) as Observable<{ organizations: string[] }>;
        }
        return of(null);
      }),
      switchMap(userData => {
        if (userData?.organizations && userData.organizations.length > 0) {
          const orgRequests = userData.organizations.map(orgId => this.getOrganizationInfo(orgId));
          return forkJoin(orgRequests);
        }
        return of([]);
      })    
    );
  }

  private getOrganizationInfo(orgId: string): Observable<{ _id: string, name: string }> {
    const orgDocRef: DocumentReference = doc(this.orgCollection, orgId);
    return docData(orgDocRef).pipe(
      first(),
      map(document => ({
        _id: document?.['_id'],
        name: document?.['name'],
      }))
    );
  }

  getOrganizationDivisions(orgId: string): Observable<string[]> {
    const orgDocRef = doc(this.orgCollection, orgId);
    const organizationUsersSnapshot = docData(orgDocRef) as Observable<{ divisions: string[] }>;
    return organizationUsersSnapshot.pipe(
      map(data => data.divisions)
    );
  }

  saveDocument(file: PDFDocument, data: DocumentForm, concepts: string[]): Observable<void> {
    if (this.userId == '') return throwError(() => new Error('Login to save a file'));
    return this.preparePdfBlob(file).pipe(
      concatMap(blob => this.uploadPdf(blob, data.name)),
      concatMap(downloadUrl => this.saveDocumentMetadata(downloadUrl, data, concepts)),
      catchError( () => throwError(
        () => new Error('Something went wrong. Try to upload this file later.')
      ))
    );
  }

  private preparePdfBlob(file: PDFDocument): Observable<Blob> {
    return from(file.save()).pipe(
      map(pdfBytes => new Blob([pdfBytes], { type: 'application/pdf' }))
    );
  }

  private uploadPdf(blob: Blob, fileName: string): Observable<string> {
    const path = `other/custom-${fileName}-${this.userId}`;
    const storageRef = ref(this.storage, path);
    return from(uploadBytes(storageRef, blob)).pipe(
      concatMap(() => getDownloadURL(storageRef))
    );
  }

  private saveDocumentMetadata(downloadUrl: string, data: DocumentForm, concepts: string[]): Observable<void> {
    const conceptObservables = concepts.map(concept =>
      this.bokInfoService.getConceptName(concept).pipe(
        take(1),
        map(conceptName => `[${concept}] ${conceptName}`)
      )
    );
    return forkJoin(conceptObservables).pipe(
      concatMap(formatedConcepts => {
        const timestamp = serverTimestamp();
        const orgRef = doc(this.docsCollection);
        const newDocument: AnnotatedDocument = new AnnotatedDocument(orgRef.id, downloadUrl, this.userId, data.organization._id, data.organization.name, 'Other', 'Other', data.publicFile, data.name, data.name, data.description, formatedConcepts, 3, timestamp, timestamp, data.division);
        return from(setDoc(orgRef, newDocument.toPlainObject()));
      })
    );
  }

}