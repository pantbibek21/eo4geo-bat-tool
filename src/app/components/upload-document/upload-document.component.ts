import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';

import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-document',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
})
export class UploadDocumentComponent implements OnDestroy {
  progress: number = 0;
  fileName: string = '';
  fileSize: string = '';
  pageCount: number = 0;
  bokKeywordsRDFstring?: string = '';
  showProgressBar: boolean = false;
  description: string = '';
  message: string = '';
  bokRelations: string[] = [];

  private pdfDoc: PDFDocument | null = null; // Store the PDF globally
  private subscription: Subscription = new Subscription();

  constructor(private sharedService: SharedService) {
    this.subscription = this.sharedService.clear$.subscribe(() => {
      this.onClear();
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.isFileAvailable = true;
      this.fileName = file.name.slice(0, -4);
      this.fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      this.pageCount = 4;
      this.showProgressBar = true;
      this.progress = 0; // Reset progress

      this.sharedService.setIsPdfAvailable(true);

      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.progress = Math.round((event.loaded / event.total) * 100);
        }
      };

      reader.onloadend = () => {
        this.progress = 100; // Complete progress
      };

      // Start reading the file
      reader.readAsArrayBuffer(file);

      const arrayBuffer = await file.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      this.pageCount = this.pdfDoc.getPageCount();
      this.bokKeywordsRDFstring = this.pdfDoc.getSubject() || '';
      this.getBoKRelationsArray(this.bokKeywordsRDFstring); // takes the subject; extracts the BoK relations; and updates bokRelations array

      this.updateBoKConcept(this.bokRelations);
      // create bok concepts array and set the global state
    }
  }

  getBoKRelationsArray(subject: string) {
    const regex = /description\$\s*(.*)/;
    const match = subject.match(regex);
    this.description = match ? match[1].trim() : '';

    if (subject.length != 0 && typeof subject === 'string') {
      this.bokRelations = [...subject.matchAll(/eo4geo:([\w\d-]+)/g)].map(
        (match) => match[1]
      );
    }
  }

  async onDownload() {
    // check if file is available; if available, download, otherwise, set error message telling no file available to downlaod!
    if (this.sharedService.getIsPdfAvailable() && this.pdfDoc) {
      // fetch the BoK relations and set the metadata configuring the subject in RDF format!

      const latestBoKRelations = this.sharedService.getBokConcept();
      const relationsMetadata = this.configureMetaData(latestBoKRelations);
      this.pdfDoc?.setTitle(this.fileName);
      this.pdfDoc?.setSubject(relationsMetadata);
      const pdfBytes = await this.pdfDoc.save();

      // set title and download pdf
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.fileName;
      link.click();
    } else {
      this.message = 'No file available to download!';

      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  onClear() {
    this.fileName = '';
    this.fileSize = '';
    this.bokKeywordsRDFstring = '';
    // this.isFileAvailable = false;
    this.sharedService.setIsPdfAvailable(false);
    this.pageCount = 0;
    this.showProgressBar = false;
  }

  updateBoKConcept(data: string[]) {
    this.sharedService.setBokConcept(data);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Unsubscribe to avoid memory leaks
  }

  configureMetaData(relations: string[]) {
    const title = this.fileName;
    const bokRelations = relations.map(
      (relation) => 'dc:relation eo4geo:' + relation
    );
    const bokRelationsString = bokRelations.join('; ');
    const rdfPrefix = `@prefix dc: <http://purl.org/dc/terms/> . @prefix eo4geo: <http://bok.eo4geo.eu/> . <> dc:title "${title}"; ${bokRelationsString} . description$ ${this.description}`;

    return rdfPrefix;
  }
}
