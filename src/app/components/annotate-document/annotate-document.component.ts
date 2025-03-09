import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-annotate-document',
  imports: [CommonModule],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent {
  bokConcepts: string[] = [];

  constructor(private sharedService: SharedService) {}

  onClear() {
    this.sharedService.triggerClear();
  }

  ngOnInit() {
    this.sharedService.bokConcept$.subscribe((bok) => {
      if (bok) {
        this.bokConcepts = [
          ...[...bok.matchAll(/eo4geo:([A-Z]+[\d\-]+)/g)].map(
            (match) => match[1]
          ),
        ];
      }
    });
  }
}
