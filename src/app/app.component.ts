import { Component } from '@angular/core';
import { HeaderComponent, FooterComponent } from '@eo4geo/ngx-bok-utils';
import { MenuItem } from 'primeng/api';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class AppComponent {
  headerItems: MenuItem[] = [
    {
      label: 'Tools',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'BoK Visualization & Search',
          icon: 'pi pi-search',
          url: 'https://bok.eo4geo.eu',
        },
        {
          label: 'Occupational Profile Tool',
          icon: 'pi pi-users',
          url: 'https://eo4geo-opt.web.app',
        },
        {
          label: 'Job Offer Tool',
          icon: 'pi pi-book',
          url: 'https://eo4geo-jot.web.app',
        },
        {
          label: 'Curriculum Design Tool',
          icon: 'pi pi-sitemap',
          url: 'https://eo4geo-cdt.web.app',
        },
        {
          label: 'BoK Annotation Tool',
          icon: 'pi pi-pencil',
          style: { '--p-tieredmenu-item-color': 'var(--hover-color)' },
          iconStyle: { color: 'var(--hover-color)' },
        },
        {
          label: 'BoK Matching Tool',
          icon: 'pi pi-equals',
          url: 'https://eo4geo-bmt.web.app',
        },
      ],
    },
    {
      label: 'Share',
      icon: 'pi pi-share-alt',
      items: [
        {
          label: 'X',
          icon: 'pi pi-twitter',
          url: 'https://twitter.com/SpaceSUITE_eu',
        },
        {
          label: 'Facebook',
          icon: 'pi pi-facebook',
          url: 'https://www.facebook.com/spacesuiteproject/',
        },
        {
          label: 'Youtube',
          icon: 'pi pi-youtube',
          url: 'https://www.youtube.com/@SpaceSUITE_eu',
        },
        {
          label: 'LinkedIn',
          icon: 'pi pi-linkedin',
          url: 'https://www.linkedin.com/showcase/spacesuite_eu/',
        },
      ],
    },
  ];

  constructor(private router: Router) {}

  redirectToProfile() {
    this.router.navigate(['profile'], { replaceUrl: true });
  }

  redirectToOrganizations() {
    this.router.navigate(['organizations'], { replaceUrl: true });
  }
}
