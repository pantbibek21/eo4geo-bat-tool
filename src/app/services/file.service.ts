import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private bokConcepts = new BehaviorSubject<string[]>([]);
  private pdfFile = new BehaviorSubject<PDFDocument | null>(null);
  private fileName = new BehaviorSubject<string>('');

  bokConcept$ = this.bokConcepts.asObservable();
  pdfFile$ = this.pdfFile.asObservable()
  fileName$ = this.fileName.asObservable()

  setBokConcept(value: string[]) {
    this.bokConcepts.next(value);
  }

  setPdfFile(value: PDFDocument) {
    this.pdfFile.next(value);
  }

  setFileName(name: string) {
    this.fileName.next(name);
  }
}
