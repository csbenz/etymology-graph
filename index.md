---
layout: page
title: Homepage
permalink: /
---

## Decription

### Overview

We intend to create an interactive representation of the etymology of the english dictionary.
The global design idea would be to have an interactive graph of the etymology (nodes:=words, links:=etymology or derived form) along with a navigational search part to look for the etymology of a specific word or look for the words derived from one common root.

### Related work and inspiration

The website hosting the database [Etymological Wordnet](http://www1.icsi.berkeley.edu/~demelo/etymwn/) (credits:  Gerard de Melo) is originally a complete project providing an API to request the etymology of a word. Our goal would be to provide a more visually-appealing representation of the data, and fully hosted on a website.

### Representation goals 

The goal is to nicely visualize the complex intertwining of the different languages and to highlight the various origins of the english language. The data would mostly grouped by language and more precisely by groups of proximity (find, finding, found would be relatively close in the graph). As the main focus is the english language, would only be represented the words of other languages that are part of the etomology of the english dictionary.

## Dataset

### Basic entry definition

An entry of the dataset is of the form (l1:w1 e l2:w2) and means 'word w1 from language l1 has a link e with word w2 from language l2'.

Note: the l1, l2 codes for languages respect the [ISO 639-3](https://en.wikipedia.org/wiki/ISO_639-3) code for the representation of names of languages.

### Some examples

Here are some examples of the possible entries:
* (eng:defeat etymology fra:défaire) means 'defeat (eng) has for etymology défaire (fra)'
* (fra:défaire etymology_origin_of eng:defeat) means the same thing
* (eng:defeated is_derived_from eng:defeat) means 'defeated (eng) is a derived form of defeat (eng)'
* (eng:defeat has_derived_form eng:defeated) means the same thing

