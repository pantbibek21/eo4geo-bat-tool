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
  // define the variables
  progress: number = 0;
  fileName: string = '';
  fileSize: string = '';
  pageCount: number = 0;
  bokKeywordsRDFstring?: string = '';
  showProgressBar: boolean = false;
  message: string = '';
  bokRelations: string[] = [];

  private pdfDoc: PDFDocument | null = null; // Store the PDF globally
  private subscription: Subscription = new Subscription();

  constructor(private sharedService: SharedService) {
    this.subscription = this.sharedService.clear$.subscribe(() => {
      this.onClear();
    });
  }

  // triggers when file is loaded
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.sharedService.triggerClear()
      const file = input.files[0];
      this.fileName = file.name.slice(0, -4);
      this.fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB'; // store size in mb
      this.showProgressBar = true;
      this.progress = 0; // Reset progress

      // update the service
      this.sharedService.setIsPdfAvailable(true);

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
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      this.pageCount = this.pdfDoc.getPageCount();

      // subject key stores our RDF formatted string holding BoK relations and description together
      this.bokKeywordsRDFstring = this.pdfDoc.getSubject() || '';

      // takes the subject; extracts the BoK relations; and updates bokRelations array
      this.getBoKRelationsArray(this.bokKeywordsRDFstring);

      // updates BoK keywords in service to be globally avaiable to be used in annotation component
      this.updateBoKConcept(this.bokRelations);
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

  async onDownload() {
    // check if file is available; if available, download, otherwise, set error message telling no file available to downlaod!
    if (this.sharedService.getIsPdfAvailable() && this.pdfDoc) {
      // fetch the BoK relations and set the metadata configuring the subject in RDF format!
      const latestBoKRelations = this.sharedService.getBokConcept();

      // function returns the configured string in RDF format
      const relationsMetadata = this.configureMetaData(latestBoKRelations);
      this.pdfDoc?.setTitle(this.fileName);

      // stores the RDF format string holding BoK keys and relations
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

  // clears the inputs fields and progress bar
  onClear() {
    this.fileName = '';
    this.fileSize = '';
    this.bokKeywordsRDFstring = '';
    this.sharedService.setIsPdfAvailable(false);
    this.pageCount = 0;
    this.showProgressBar = false;
    this.bokRelations = []
  }

  // updates the service with Bok keywords
  updateBoKConcept(data: string[]) {
    this.sharedService.setBokConcept(data);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Unsubscribe to avoid memory leaks
  }

  // creates a RDF formatted string for BoK keywords
  configureMetaData(relations: string[]) {
    const bokRelations = relations.map(
      (relation) => 'dc:relation eo4geo:' + relation
    );
    const bokRelationsString = bokRelations.join('; ');
    const rdfPrefix = `@prefix dc: <http://purl.org/dc/terms/> . @prefix eo4geo: <http://bok.eo4geo.eu/> . <> ${bokRelationsString} .`;

    return rdfPrefix;
  }
}
