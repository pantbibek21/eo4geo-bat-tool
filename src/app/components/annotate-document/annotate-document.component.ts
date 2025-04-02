import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import {
  BokInformationService,
} from '@eo4geo/ngx-bok-visualization';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-annotate-document',
  imports: [CommonModule],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent {
  bokConcepts: string[] = [];
  @Input() concept: string = 'GIST';
  conceptName: string = '';
  conceptColor: string = '';
  message: string = '';
  isPdfAvailable: boolean = false;

  constructor(
    private sharedService: SharedService,
    private bokInfoService: BokInformationService
  ) {}

  // clears the input fields and progress bar
  onClear() {
    this.sharedService.resetBokConcept();
    this.bokConcepts = [];
  }

  // delete individual BoK keyword
  deleteBokConcept(concept: string) {
    this.bokConcepts = this.bokConcepts.filter((item) => item !== concept);

    // update the global BoK relations array too
    this.sharedService.setBokConcept([...this.bokConcepts]);
  }

  // updates the BoK annotation
  addAnnotation() {
    if (this.bokConcepts.includes(this.concept)) {
      this.message = 'Concept already included!';

      setTimeout(() => (this.message = ''), 3000);
    } else {
      const currentConcepts = this.sharedService.getBokConcept();
      this.sharedService.setBokConcept([...currentConcepts, this.concept]);
    }
  }

  // gets the background color of click BoK bubble and adds light opacity
  getBackgroundColor(concept: string): Observable<string> {
    return this.bokInfoService
      .getConceptColor(concept)
      .pipe(map((hex) => this.hexToRgba(hex, 0.5)));
  }

  // fetches the BoK keyword title
  getConceptName(concept: string) {
    this.bokInfoService.getConceptName(concept).subscribe((name) => {
      this.conceptName = name;
    });

    return this.conceptName;
  }

  // makes the BoK tags light adding opacity
  private hexToRgba(hex: string, alpha: number): string {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');

    // Parse r, g, b values
    let r: number, g: number, b: number;
    if (hex.length === 3) {
      // Convert shorthand hex (e.g., #abc to #aabbcc)
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  ngOnInit() {
    //  Listen for bokConcept updates
    this.sharedService.bokConcept$.subscribe((bok) => {
      if (this.sharedService.getIsPdfAvailable()) {
        console.log('pdf: ' + this.sharedService.getIsPdfAvailable());
        this.isPdfAvailable = true;
        this.bokConcepts = bok;
      }
    });

    // Get concept name
    this.bokInfoService.getConceptName('GIST').subscribe((name) => {
      this.conceptName = name;
    });
  }
}
