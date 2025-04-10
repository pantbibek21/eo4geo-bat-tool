import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-ai-modal',
  imports: [ButtonModule, FormsModule],
  templateUrl: './ai-modal.component.html',
  styleUrl: './ai-modal.component.css',
})
export class AiModalComponent {
  annotationNumber: number = 5;
  annotationDepth: string = '';

  constructor(private fileService: FileService) {}

  generateRelation() {
    console.log('Hello');
  }

  closeModal() {
    this.fileService.setIsModalVisible(false);
  }
}
