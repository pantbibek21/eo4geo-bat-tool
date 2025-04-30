import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { prompt } from '../../environments/prompt';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private annotations: string[] = [];
  private errorMessage = new BehaviorSubject<string>('');

  constructor() {}

  errorMessage$ = this.errorMessage.asObservable();

  async generateAnnotation(
    content: string,
    annotationDepth: string,
    annotationNumber: number
  ): Promise<string | null> {
    console.log('Loading...');
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: environment.openRouterKey,
            'HTTP-Referer': '<YOUR_SITE_URL>',
            'X-Title': '<YOUR_SITE_NAME>',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-405b:free',
            messages: [
              { role: 'system', content: prompt.system },
              {
                role: 'user',
                content: `I want you to annotate the following content. Number of annotations: ${annotationNumber}  
                        Depth level: ${annotationDepth} 
                        Content: """
                        ${content}
                        """
                        Please return ${annotationNumber} annotations using only concepts from the ${annotationDepth} level.`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.choices[0].message.content);
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error:', error);
      this.setError(error); // still set your service-level error
      return null; // <—— important!
    }
  }

  getError() {
    return this.errorMessage;
  }

  setError(msg: string) {
    this.errorMessage.next(msg);
  }
}
