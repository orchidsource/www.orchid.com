import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { filter, tap } from 'rxjs/operators';

const purpleURLs = [
  '/priv8',
];

const slimURLs = [
  '/',
];
@Component({
  selector: "app-page-layout",
  templateUrl: "./page-layout.component.html",
  styleUrls: ["./page-layout.component.scss"]
})
export class PageLayoutComponent implements OnInit {
  js: boolean = false;
  animateMenu: boolean = false;
  isOpen: boolean = false;
  noShadow: boolean = true;
  purple: boolean = false;
  slim: boolean = false;
  blogLink: string;
  year: number;
  router: Router;
  computeBadge: Function;
  badgeActive: boolean = false;

  constructor(
    route: ActivatedRoute,
    router: Router,
    @Inject(LOCALE_ID) protected localeId: string,
  ) {
    this.router = router;
    if (purpleURLs.includes(router.url)) {
      this.purple = true;
    }
    if (slimURLs.includes(router.url)) {
      this.slim = true;
    }
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      route.firstChild.data.subscribe(d => {
        this.purple = !!d["purpleLayout"];
        if (this.computeBadge) {
          this.badgeActive = false;
          this.computeBadge();
          window.requestAnimationFrame(()=>{
            this.computeBadge();
          })
        }
      });
    });
    this.year = new Date().getFullYear();
  }

  ngOnInit() {
    if (purpleURLs.includes(this.router.url)) {
      this.purple = true;
    }
    if (slimURLs.includes(this.router.url)) {
      this.slim = true;
    }

    this.blogLink = "https://blog.orchid.com/";
    if (this.localeId !== 'en-US') {
      this.blogLink = `https://blog.${this.localeId}.orchid.com/`;
    }

    const doc = typeof document !== "undefined" && document;
    if (doc) {
      this.js = true;

      let nav = doc.getElementById("nav") as HTMLElement;
      let banner = doc.getElementById("nav-infobar") as HTMLElement;
      let close = doc.getElementById("nav-flyout-close") as HTMLButtonElement;
      let bkgd = doc.getElementById("nav-flyout-bkgd") as HTMLDivElement;
      let btn = doc.getElementById("nav-toggle") as HTMLButtonElement;
      let pin = doc.getElementById("nav-pin") as HTMLDivElement;
      let body = doc.body;

      // This prevents an annoying bug with the stylesheets where the menu slides
      // out of view immediately after loading
      setTimeout(_ => this.animateMenu = true, 20);

      let blmBadge = doc.getElementById('maker-badge');
      let blmBadgeBtn = doc.getElementById('maker-badge__btn');
      let blmBadgeCtn = doc.getElementById('maker-badge__content');
      this.computeBadge = () => {
        if (!this.badgeActive) {
          blmBadge.style.top = `${-blmBadgeCtn.offsetHeight + 1 + nav.offsetHeight + banner.offsetHeight}px`;
          if (window.innerWidth <= 870) {
            blmBadge.style.left = `-150px`;
          } else {
            blmBadge.style.left = `0px`;
          }
        } else {
          blmBadge.style.top = `${nav.offsetHeight + banner.offsetHeight - 1}px`;
          blmBadge.style.left = `0px`;
        }
      }

      window.addEventListener('DOMContentLoaded', () => {
        this.badgeActive = false;
        this.computeBadge();
      })
      window.addEventListener('load', () => {
        this.computeBadge();
      })
      blmBadgeBtn.addEventListener('click', () => {
        this.badgeActive = !this.badgeActive
        this.computeBadge();
      })
      window.addEventListener('resize', () => {
        this.computeBadge();
      });

      const toggleMenuOpen = () => {
        if (this.isOpen) body.classList.add("navigation-open");
        else body.classList.remove("navigation-open");
      }

      btn.addEventListener("click", _ => {
        this.isOpen = !this.isOpen;
        toggleMenuOpen();
      });
      close.addEventListener("click", _ => {
        this.isOpen = false;
        toggleMenuOpen();
      });
      bkgd.addEventListener("click", _ => {
        this.isOpen = false;
        toggleMenuOpen();
      });

      // NB: this is only necessary because of Angular
      doc.querySelectorAll(".nav-list a").forEach(el => {
        let a = el as HTMLAnchorElement;

        a.addEventListener("click", _ => this.isOpen = false);
      });

      // #region scroll event listener

      let scheduleFrame = true;

      const checkShadow = () => {
        if (scheduleFrame) {
          scheduleFrame = false;

          requestAnimationFrame(() => {
            let navBottom = nav.getBoundingClientRect().bottom;
            let pinBottom = pin.getBoundingClientRect().bottom;

            this.noShadow = navBottom <= pinBottom;

            scheduleFrame = true;
          });
        }
      };

      doc.addEventListener("scroll", checkShadow);
      window.addEventListener("resize", checkShadow);

      // #endregion
    }
  }
}
