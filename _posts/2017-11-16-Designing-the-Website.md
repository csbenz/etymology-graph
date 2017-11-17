---
layout: post
title: Designing the website
author: Pierre ML
description: A first post about the site building and the structure
---

## Choice of GitHub Pages

We chose to create the website on **GitHub Pages** because it fits pretty well the GitHub repository system and enables us to participate efficiently on the website managing. GitHub Pages works with [Jekyll](https://jekyllrb.com/), a static site generator which allows to **generate html pages from basic md** (markdown) files. This turns out to be pretty useful when making regular blog posts where a markdown is sufficient to encode the small presentation needed for this kind of content.

## Website structure 

<img class="post_image" src="{{ site.baseurl }}/assets/website_structure.png" alt="test">

This website's structure is pretty simple:
* a [Homepage]({{ site.baseurl }}) gathering the main info about the project.
* an [Algo]({{ site.baseurl }}/algo) page which will contain a working javascript of the project. It is not yet implemented.
* a [Posts]({{ site.baseurl }}/posts) page listing all the new updates/modifications.
* an [About]({{ site.baseurl }}/about) page with more detailed info about the group members and the course.

## Website design

Similarly to the structure, the design is pretty pure:
* a basic **menu bar** regrouping all above pages and the icon.
* a **title header** with the title and description of the current page.
* the **core content** on a centered portion of the page, with grey margins.
* a minimalistic **footer** with link to the GitHub repository.

The design is clear to avoid any confusion about the principal information on the page. All pages are easily accessible via the menu and it is easy to navigate between the blog posts.

Though the design of the website may be changed, it will stay as clear as possible to help the user browsing the website.