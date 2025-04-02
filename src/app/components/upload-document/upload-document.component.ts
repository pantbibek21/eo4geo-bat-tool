import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-upload-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
})
export class UploadDocumentComponent {
  // define the variables
  progress: number = 0;
  fileName: string = '';
  fileSize: string = '';
  pageCount: number = 0;
  bokKeywordsRDFstring?: string = '';
  showProgressBar: boolean = false;

  private bokRelations: string[] = [];
  private pdfDoc: PDFDocument | null = null; // Store the PDF globally

  constructor(private fileService: FileService) {}

  // triggers when file is loaded
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.onClear()
      const file = input.files[0];
      this.fileName = file.name.slice(0, -4);
      this.fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB'; // store size in mb
      this.showProgressBar = true;
      this.progress = 0; // Reset progress

      // create a reader object
      const reader = new FileReader();

      // calculate the progress during file upload
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.progress = Math.round((event.loaded / event.total) * 100);
        }
      };

      reader.onloadend = () => {
        this.progress = 100; // Complete progress
      };

      // start reading the file
      reader.readAsArrayBuffer(file);

      const arrayBuffer = await file.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer)
      this.pageCount = this.pdfDoc.getPageCount();

      // subject key stores our RDF formatted string holding BoK relations and description together
      this.bokKeywordsRDFstring = this.pdfDoc.getSubject() || '';
      this.getBoKRelationsArray(this.bokKeywordsRDFstring);

      this.fileService.setPdfFile(this.pdfDoc)
      this.fileService.setFileName(this.fileName)
      this.fileService.setBokConcept(this.bokRelations);
    }
  }

  // function extracts the description and BoK relations
  getBoKRelationsArray(subject: string) {
    if (subject.length != 0 && typeof subject === 'string') {
      this.bokRelations = [...subject.matchAll(/eo4geo:([\w\d-]+)/g)].map(
        (match) => match[1]
      );
    }
  }

  // clears the inputs fields and progress bar
  onClear() {
    this.progress = 0;
    this.fileName = '';
    this.fileSize = '';
    this.pageCount = 0;
    this.bokKeywordsRDFstring = '';
    this.showProgressBar = false;
    this.bokRelations = [];
  }
}
