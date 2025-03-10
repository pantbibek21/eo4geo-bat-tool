import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import {
  BokComponent,
  BokInformationService,
} from '@eo4geo/ngx-bok-visualization';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-annotate-document',
  imports: [CommonModule, BokComponent],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent {
  bokConcepts: string[] = [];
  concept: string = 'GIST';
  conceptName: string = '';
  conceptColor: string = '';
  message: string = '';

  constructor(
    private sharedService: SharedService,
    private bokInfoService: BokInformationService
  ) {}

  onClear() {
    this.sharedService.resetBokConcept();
    this.bokConcepts = [];
    // this.sharedService.triggerClear();
  }

  deleteBokConcept(concept: string) {
    this.bokConcepts = this.bokConcepts.filter((item) => item !== concept);
    // delete from global BoK relations array
    this.sharedService.setBokConcept([...this.bokConcepts]);
  }

  addAnnotation() {
    if (this.bokConcepts.includes(this.concept)) {
      this.message = 'Concept already included!';

      setTimeout(() => (this.message = ''), 3000);
    } else {
      const currentConcepts = this.sharedService.getBokConcept();
      this.sharedService.setBokConcept([...currentConcepts, this.concept]);
    }
  }

  getBackgroundColor(concept: string): Observable<string> {
    return this.bokInfoService.getConceptColor(concept);
  }

  getConceptName(concept: string) {
    this.bokInfoService.getConceptName(concept).subscribe((name) => {
      this.conceptName = name;
    });

    return this.conceptName;
  }

  ngOnInit() {
    //  Listen for bokConcept updates
    this.sharedService.bokConcept$.subscribe((bok) => {
      if (bok.length != 0) {
        this.bokConcepts = bok;
      }
    });

    // Get concept name
    this.bokInfoService.getConceptName('GIST').subscribe((name) => {
      this.conceptName = name;
    });
  }
}
