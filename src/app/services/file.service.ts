import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { BehaviorSubject } from 'rxjs';
import { DocumentForm } from '../model/documentForm';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private bokConcepts = new BehaviorSubject<string[]>([]);
  private pdfFile = new BehaviorSubject<PDFDocument | null>(null);
  private formData = new BehaviorSubject<DocumentForm | null>(null);

  bokConcept$ = this.bokConcepts.asObservable();
  pdfFile$ = this.pdfFile.asObservable()
  formData$ = this.formData.asObservable()

  setBokConcept(value: string[]) {
    this.bokConcepts.next(value);
  }

  setPdfFile(value: PDFDocument) {
    this.pdfFile.next(value);
  }

  setFileName(name: string) {
    let oldData: DocumentForm = this.formData.getValue() ?? 
    {
      name: '',
      description: '',
      publicFile: false,
      organization: {_id: '', name: ''},
      division: ''
    };
    oldData.name = name;
    this.formData.next(oldData);
  }

  setDocumentForm(form: DocumentForm) {
    this.formData.next(form);
  }

  resetValues() {
    this.bokConcepts.next([]);
    this.pdfFile.next(null);
    this.formData.next(null);
  }
}
