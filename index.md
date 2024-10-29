---
title: Music (and Sounds) with Pharo
---

## Latest Posts



<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <p>{{ post.excerpt }}</p> <!-- Display post excerpts -->
  </li>
{% endfor %}
</ul>
