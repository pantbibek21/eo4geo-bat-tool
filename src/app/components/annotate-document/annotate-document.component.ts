import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-annotate-document',
  imports: [],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent {
  bokConcepts: string = '';

  constructor(private sharedService: SharedService) {}

  onClear() {
    this.sharedService.triggerClear();
  }

  ngOnInit() {
    this.sharedService.bokConcept$.subscribe((value) => {
      this.bokConcepts = value; // Updates when value changes
    });
  }
}
