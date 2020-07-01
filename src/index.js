import React, { Component } from 'react';

class ScrollspyNav extends Component {
  constructor(props) {
    super(props);

    this.props = props;
    this.scrollTargetIds = this.props.scrollTargetIds;
    this.activeNavClass = this.props.activeNavClass;
    this.scrollDuration = Number(this.props.scrollDuration) || 1000;
    this.headerBackground = this.props.headerBackground === "true" ? true : false;
    this.offset = this.props.offset || 0;

    this.onScroll = this.onScroll.bind(this);

    if(this.props.router && this.props.router === "HashRouter") {
      this.homeDefaultLink = "#/";
      this.hashIdentifier = "#/#";
    } else {
      this.homeDefaultLink = "/";
      this.hashIdentifier = "#";
    }
  }

  onScroll() {
    let scrollSectionOffsetTop;
    this.scrollTargetIds.map((sectionID, index) => {
      scrollSectionOffsetTop = (document.getElementById(sectionID).offsetTop + this.offset) - (this.headerBackground ? document.querySelector("div[data-nav='list']").scrollHeight : 0);
    
    if (Math.ceil(window.pageYOffset) >= scrollSectionOffsetTop && Math.ceil(window.pageYOffset) < scrollSectionOffsetTop + (document.getElementById(sectionID).scrollHeight - this.offset)) {
        this.getNavLinkElement(sectionID).classList.add(this.activeNavClass);
        this.clearOtherNavLinkActiveStyle(sectionID)
      } else {
        this.getNavLinkElement(sectionID).classList.remove(this.activeNavClass);
      }
  
      if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight && index === this.scrollTargetIds.length - 1) {
        this.getNavLinkElement(sectionID).classList.add(this.activeNavClass);
        this.clearOtherNavLinkActiveStyle(sectionID);
      }
    });
  }

  easeInOutQuad(current_time, start, change, duration) {
      current_time /= duration/2;
      if (current_time < 1) return change/2*current_time*current_time + start;
      current_time--;
      return -change/2 * (current_time*(current_time-2) - 1) + start;
  };

  /**
   * Perform scroll animation with given start place, end place and duration
   * @param {Number} start
   * @param {Number} to
   * @param {Number} duration
   */
  scrollTo(start, to, duration) {
    let change = to - start,
        currentTime = 0,
        increment = 10;

    let animateScroll = () => {
        currentTime += increment;
        let val = this.easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(0, val);
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };

    animateScroll();
  }

  /**
   * Get the nav link element with a given sectionID that the nav link links to
   * @param {String} sectionID
   */
  getNavLinkElement(sectionID) {
    return document.querySelector(`a[href='${this.hashIdentifier}${sectionID}']`);
  }

  /**
   * Given a nav href url, get its clean sectionID based on if there is hash router identifier or not
   * @param {String} navHref
   */
  getNavToSectionID(navHref) {
    return navHref.includes(this.hashIdentifier) ? navHref.replace(this.hashIdentifier, "") : "";
  }

  /**
   * Clear the highlight style on the non-current viewed nav elements
   * @param {String} excludeSectionID 
   */
  clearOtherNavLinkActiveStyle(excludeSectionID) {
    this.scrollTargetIds.map((sectionID, index) => {
      if (sectionID !== excludeSectionID) {
        this.getNavLinkElement(sectionID).classList.remove(this.activeNavClass);
      }
    });
  }

  componentDidMount() {
    if (document.querySelector(`a[href='${this.homeDefaultLink}#']`)) {
      document.querySelector(`a[href='${this.homeDefaultLink}#']`).addEventListener("click", (event) => {
        event.preventDefault();
        this.scrollTo(window.pageYOffset, 0, this.scrollDuration);
        window.location.hash = "";
      });
    }

    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
   }

   if (!String.prototype.includes) {
      String.prototype.includes = function() {
          'use strict';
          return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }


    document.querySelector("div[data-nav='list']").querySelectorAll("a").forEach( (navLink) => {
      navLink.addEventListener("click", (event) => {
        event.preventDefault();
        let sectionID = this.getNavToSectionID(navLink.getAttribute("href"));

        if(sectionID) {
          let scrollTargetPosition = document.getElementById(sectionID).offsetTop - (this.headerBackground ? document.querySelector("div[data-nav='list']").scrollHeight : 0);
          this.scrollTo(window.pageYOffset, scrollTargetPosition + this.offset, this.scrollDuration);
        } else {
          this.scrollTo(window.pageYOffset, 0, this.scrollDuration);
        }
      });
    })

    window.addEventListener("scroll", this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }

  render() {
    return(
      <div data-nav="list">
        { this.props.children }
      </div>
    );
  }
}

export default ScrollspyNav;
