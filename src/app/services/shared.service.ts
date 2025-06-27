import { Injectable } from '@angular/core';
import { BokInformationService } from '@eo4geo/ngx-bok-visualization';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private bokInfoService: BokInformationService) {}

  getBackgroundColor(concept: string) {
    return this.bokInfoService.getConceptColor(concept).pipe(
      take(1),
      map((hex) => {
        const fallbackHex = '#ffcccc'; // default light red
        const colorHex = hex ?? fallbackHex; // use fallback if hex is null or undefined
        return this.hexToRgba(colorHex, 0.5);
      })
    );
  }

  // fetches the BoK keyword title
  getConceptName(concept: string) {
    return this.bokInfoService.getConceptName(concept).pipe(
      take(1),
      map((name) => name)
    );
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
}
