---
title: Music (and Sounds) with Pharo
---

Here a list of the latest posts:
<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a> <!-- Correctly links to the post -->
    <p>{{ post.excerpt }}</p> <!-- Optional: Displays the post excerpt -->
  </li>
{% endfor %}
</ul>
