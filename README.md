# real-stars
Find out the *real* star count of JS repositories

Currently it is just a dump of my hacky scripts I wrote over the weekend.
Use at your own risk.

[**Demo result generated on April 15, 2018**](https://sunakujira1.github.io/real-stars/)

## Background
GitHub stars is great to find out how famous/used the library is, but it only scratches the surface.
Libraries that are dependent a lot, yet is not renowned (starred) much by GitHub users are very likely to exist.
This is an attempt to find out the *real* star count of repositories to find those libraries.

## Methodology
Currently it only looks for `language=JavaScript` repositories.
Here are the gist of the algorithm:
1. Fetch as many JS repositories as possible from GitHub.
2. Fetch for `package.json` from those JS repositories.
3. Aggregate star count by treating sharing star count to `dependencies` and `devDependencies`.

## Problems to further investigate
- GitHub's search API only returns upto page 10.

### Side note
There are definitely better ways to approach this, but regardless I wanted to play around with GutHub API and simple data aggregation.
