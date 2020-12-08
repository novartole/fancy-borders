import './../style/index.css';
import { wrapper, priorityValues } from "./queueManager.js";

const linkInterval = 200,
      links = document.querySelector(".header-links");
      
const wrappedlinksHoverHandler = wrapper(linksHoverHandler, priorityValues.HIGH);
links.onmouseenter = links.onmouseleave = event => {
  hideMainNavigations();

  if ("mouseleave" == event.type) {
    event.target.querySelectorAll(".header-link").forEach(
      link => link.classList.remove("header-link_active__clickable") );
  }
  
  wrappedlinksHoverHandler(event);
}

const wrappedLinksClickHandler = wrapper(linksClickHandler, priorityValues.HIGH);
links.onclick = event => {
  if ( !event.target.matches(".header-link_active__clickable") ) return;

  wrappedLinksClickHandler(event);
}

links.__proto__.dispatchOnNavigateEvent = function(from, to) {

  this.dispatchEvent(new CustomEvent("onnavigate", { detail: { from, to } }));

}

links.addEventListener("onnavigate", function(event) {
  const [from, to] = [event.detail.from, event.detail.to];

  resetMainNavigationVisibility();

  document.querySelector(`#${from.dataset.sectionId}`).classList
    .remove("content-section__selected");
  document.querySelector(`#${to.dataset.sectionId}`).classList
    .add("content-section__selected");

  if ( to.matches(".header-link:first-child") ) {

    if ( from.matches(".header-link:last-child") ) {

      toggleBothNavigations(); return;
            
    }
    else var selector = ".main-navigation__left";

  } else if ( to.matches(".header-link:last-child") ) {

    if ( from.matches(".header-link:first-child") ) {
      
      toggleBothNavigations(); return;

    }
    else selector = ".main-navigation__right";

  } else if ( from.matches(".header-link:first-child")) {

    selector = ".main-navigation__left";

  } else if ( from.matches(".header-link:last-child") ) {

    selector = ".main-navigation__right";

  } else return;

  document.querySelector(selector).classList.toggle("navigation__navigated");

  function toggleBothNavigations() {
    document.querySelectorAll(".main-navigation").forEach(
      link => link.classList.toggle("navigation__navigated") );
  }
});

document.querySelectorAll(".main-navigation").forEach(navigation => {
  const wrappedHandler = wrapper(navigationClickHandler, priorityValues.HIGH);
  navigation.onclick = event => {
    hideMainNavigations();    

    wrappedHandler(event);
  }

  navigation.onmouseenter = navigation.onmouseleave = wrapper(navigationHoverHandler);
});

function hideMainNavigations() {
  document.querySelectorAll(".main-navigation").forEach(
    navigation => navigation.style.visibility = "hidden");
}

function resetMainNavigationVisibility() {
  document.querySelectorAll(".main-navigation").forEach(
    navigation => navigation.style.visibility = "");
}

function linksClickHandler(event) {
  const newSelectedLink = event.target;
  if ( !newSelectedLink.matches(".header-link__active:not(.header-link_active__selected)") ) {

    return Promise.resolve("");

  }
  
  const newPreviousLink = newSelectedLink.previousElementSibling,
        newNextLink = newSelectedLink.nextElementSibling,
        oldSelectedLink = event.target.parentElement.querySelector(".header-link_active__selected"),
        oldPreviousLink = oldSelectedLink.previousElementSibling,
        oldNextLink = oldSelectedLink.nextElementSibling;

  return new Promise(resolve => setTimeout(
    () => {
      applyLinkSelection(
        oldPreviousLink, oldSelectedLink, oldNextLink,
        newPreviousLink, newSelectedLink, newNextLink);

      toggleLink(oldSelectedLink);

      resolve(newSelectedLink.textContent);
    }, linkInterval));
}

function navigationClickHandler(event) {
  const navigation = event.target.closest(".main-navigation");
  if ( navigation.classList.contains("main-navigation__right") ) {
    var oldNextLink = document.querySelector("[data-position='next']");
    if (!oldNextLink) return Promise.resolve("");

    var oldSelectedLink = oldNextLink.previousElementSibling,
        oldPreviousLink = oldSelectedLink.previousElementSibling,
        newPreviousLink = oldSelectedLink,
        newSelectedLink = newPreviousLink.nextElementSibling,
        newNextLink = newSelectedLink.nextElementSibling;
  }
  else if ( navigation.matches(".main-navigation__left") ) {
    oldPreviousLink = document.querySelector("[data-position='previous']");
    if (!oldPreviousLink) return Promise.resolve("");

    oldSelectedLink = oldPreviousLink.nextElementSibling;
    oldNextLink = oldSelectedLink.nextElementSibling;
    newNextLink = oldSelectedLink;
    newSelectedLink = newNextLink.previousElementSibling;
    newPreviousLink = newSelectedLink.previousElementSibling;
  } else {
    console.log(`${navigation} navigation isn't supported`);

    return Promise.reject(event);
  }

  return new Promise(resolve => setTimeout(
    () => {
      resetMainNavigationVisibility();

      applyLinkSelection(
        oldPreviousLink, oldSelectedLink, oldNextLink,
        newPreviousLink, newSelectedLink, newNextLink);

      if ( links.matches(":hover") ) toggleLink(oldSelectedLink);

      resolve(newSelectedLink.textContent);
    }, linkInterval));
}

function applyLinkSelection(
  oldPreviousLink, oldSelectedLink, oldNextLink,
  newPreviousLink, newSelectedLink, newNextLink)
{
  oldPreviousLink?.removeAttribute("data-position");
  let list = oldSelectedLink.classList;
  if (!list.contains("header-link__big")) {
    
    list.remove("header-link__active", "header-link_active__selected");
  
  }
  list.add("header-link_active__clickable");
  oldNextLink?.removeAttribute("data-position");
  
  newPreviousLink?.setAttribute("data-position", "previous");
  list = newSelectedLink.classList;
  const classes = ["header-link_active__selected"];
  if (!list.contains("header-link__big")) {

    classes.push("header-link__active");

  }
  list.add(...classes);
  list.remove("header-link_active__clickable");
  newNextLink?.setAttribute("data-position", "next");

  document.querySelector(".header-links")
    .dispatchOnNavigateEvent(oldSelectedLink, newSelectedLink);
}

function linksHoverHandler(event) {
  const [type, links] = [event.type, event.target];
  switch (type) {
    case "mouseenter":
      var selector = ".header-link:not(.header-link__active)",
          bigLink = links.querySelector(".header-link__big ~ .header-link_active__selected")
                    ? links.querySelector(".header-link__big")
                    : null;
      break;
  
    case "mouseleave":
      selector = ".header-link__active:not(.header-link__big):not(.header-link_active__selected)";
      bigLink = links.querySelector(".header-link__big:not(.header-link_active__selected)");
      break;

    default:
      console.log(`${type} event type isn't supported`);

      return Promise.reject(event);
  }

  const linksAsArray = Array.from( links.querySelectorAll(selector) );
  if (bigLink) linksAsArray.push(bigLink);

  return Promise.all(
    linksAsArray
      .sort( (linkA, linkB) => getCursorLinkDistance(linkA) - getCursorLinkDistance(linkB) )
      .map( (link, index) => new Promise(
        resolve => setTimeout(
          () => {
            toggleLink(link);

            resolve(link);
          }, (1 + index) * linkInterval)) )).then(
            links => {
              if ("mouseenter" == type) {

                links.forEach( link => link.classList.add("header-link_active__clickable") );

              }

              resetMainNavigationVisibility();

              return links.map(link => link.textContent);
            });
    
  function getCursorLinkDistance(link) {
    return Math.abs( event.clientX - (link.offsetLeft + link.offsetWidth / 2) );
  }
}

function toggleLink(link) {
  if ( link.matches(".header-link__big") ) var className = "header-link_active__selected";
  else className = "header-link__active";
  link.classList.toggle(className);
}

function navigationHoverHandler(event) {
  const target = event.target;
  if ( target.matches(".main-navigation__right") ) var position = "next";
  else if ( target.matches(".main-navigation__left") ) position = "previous";
  else {
    console.log("The handled navigation isn't supported");

    return Promise.reject(event);
  }
  
  const upcomingLink = document.querySelector(`[data-position='${position}']`);
  if (!upcomingLink) return Promise.resolve("");

  const type = event.type;
  switch (type) {
    case "mouseenter":
      if ( upcomingLink.matches(".header-link__big") ) {

        var [methodName, className] = ["remove", "header-link_active__selected"];
      
      } else {

        [methodName, className] = ["add", "header-link__active"];

      }
      break;

    case "mouseleave":
      if ( upcomingLink.matches(".header-link__big") ) {
        
        [methodName, className] = ["add", "header-link_active__selected"];
      
      } else {
        
        [methodName, className] = ["remove", "header-link__active"];

      }
      break;
  
    default:
      console.log(`${type} event type isn't supported`);

      return Promise.reject(event);
  }

  return new Promise(resolve => {
    setTimeout( () => {
      upcomingLink.classList[methodName](className);

      resolve(upcomingLink.textContent);
    }, linkInterval )});
}