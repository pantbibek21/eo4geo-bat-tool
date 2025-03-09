import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-annotate-document',
  imports: [],
  templateUrl: './annotate-document.component.html',
  styleUrl: './annotate-document.component.css',
})
export class AnnotateDocumentComponent {
  constructor(private sharedService: SharedService) {}

  onClear() {
    this.sharedService.triggerClear();
  }
}
