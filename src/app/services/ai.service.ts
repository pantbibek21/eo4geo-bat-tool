import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { prompt } from '../../environments/prompt';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private annotations: string[] = [];

  constructor() {}

  async generateAnnotation() {
    console.log('Loading...');
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: environment.openRouterKey,
            'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
            'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-r1:free',
            messages: [
              {
                role: 'system',
                content: prompt.system,
              },
              {
                role: 'user',
                content: prompt.user,
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
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
