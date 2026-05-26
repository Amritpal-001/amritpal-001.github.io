# updated website

This repo is built on a fork of **Jekyll Now** from [this repository](https://github.com/barryclark/jekyll-now). **Jekyll** is a static site generator that's perfect for GitHub hosted blogs ([Jekyll Repository](https://github.com/jekyll/jekyll))

The website design is just a modification of [Jon Barron's website](https://jonbarron.info/) and is converted for my own use, re-purposing my old markdown posts. **Feel free to use template for your own purposes**, but please respect copyright for all the images/content in my `images`, `pdfs`, `_posts` folders. 



## issues
* In general, jekyll will try to build a full page for every post. I skip that by forcing `permalink: /`. This creates multiple entries in sitemap.xml for index.html but is otherwise fine. 
* If you want multiple paragraphs, consider using `excerpt_separator: <!--more-->` in `_config.yml`, for my own use I didn't need this. 
* My own posts have lots of extra stuff left over from my old jekyll design ("author", long descriptions, etc.), feel free to ignore them
* I use thumbnails, so I can upload arbitrary sized images but then only display small ones. The `_make_thumbnails.sh` script generates them and the html template looks in `tn/` for all images. 
* I have three categories of post with slightly differerent formatting, so changing sizing requires edits in multiple paces. 


Good refernces:
- https://nitkannen.github.io/
- https://github.com/leonidk/leonidk.github.io?tab=readme-ov-file
- https://leonidk.com/
- https://jonbarron.info/
- https://wanjiazhao1203.github.io/
- https://ericwu09.github.io/  ROSIE
- https://ai.stanford.edu/~wxliang/
- https://www.cs.cmu.edu/~katef/


Nice style
- https://guestrin.su.domains/
- https://cs.stanford.edu/~shirwu/

James zhao lab
- https://swansonkyle.com/
- https://nityathakkar.github.io/
- https://rthapa84.github.io/
- https://viterbi-web.usc.edu/~ruishanl/index
  
  
James zho BMI
- https://jsilbergds.github.io/
- https://elanapearl.github.io/


Modern/"Too much" style
- https://toshi2k2.github.io/publications/



## Jekyl template home page
- https://github.com/barryclark/jekyll-now/tree/master

## Local Development

1. Install Jekyll and plug-ins in one fell swoop. `gem install github-pages` This mirrors the plug-ins used by GitHub Pages on your local machine including Jekyll, Sass, etc.
2. Clone down your fork `git clone https://github.com/yourusername/yourusername.github.io.git`
3. Serve the site and watch for markup/sass changes `jekyll serve`
4. View your website at http://127.0.0.1:4000/
5. Commit any changes and push everything to the master branch of your GitHub user repository. GitHub Pages will then rebuild and serve your website.
6. 
jekyll serve --incremental --livereload



# improvments
- Replace website by "paper"
- Add pdfs locally
- Add education/work experience at bottom
- Add authors for each paper



---

# Clinical vs Technical dual-mode site

The site renders in one of two modes — **clinical** (audience-friendly phrasing) or **technical** (methods/ML/jargon-heavy phrasing). Each post, news item, and bio paragraph can declare a version for one or both modes.

## Switching modes

Three ways to control which mode visitors see:

| URL | Mode |
|---|---|
| `/` (or any plain URL) | Uses `site_mode.default` from [_config.yml](_config.yml) |
| `/?v=cl2` | Forces clinical (overrides default) |
| `/?v=tc2` | Forces technical (overrides default) |

To flip the **site-wide default**: edit [_config.yml](_config.yml):
```yaml
site_mode:
  default: clinical     # change to technical to flip
  tokens:
    clinical: cl2
    technical: tc2
```
Then commit + push — GitHub Pages rebuilds and the default flips. Rotate the tokens any time to invalidate previously shared links.

## Visibility rules

- A **post** appears in clinical mode if it has a `title:` (every post does, so all posts appear by default). It also appears in technical mode if it has `title_technical:` in frontmatter. Use `clinical_hidden: true` to hide a specific post from clinical mode.
- A **news item** appears in a given mode only if that mode's field is non-empty in [_data/news.yml](_data/news.yml). Items with `technical: ""` are hidden from technical mode.
- A **post body** uses two `{% capture %}` blocks; whichever matches the active mode is rendered. If a post lacks the active mode's content, the entire post row is hidden — no fallback.

## Authoring a new post (with both versions)

Create `_posts/YYYY-MM-DD-slug.markdown`:

```markdown
---
layout: post
title: "Clinical title here"
title_technical: "Technical title here"      # omit for clinical-only posts
date: YYYY-MM-DD 00:00:00 +00:00
categories: research                          # or 'projects'
authors: "<strong>Amritpal Singh</strong>, ..."
venue: 'Journal / Conference'
paper: https://...                            # rendered as 'Paper' link
project_page: https://...                     # optional, rendered as 'Project page'
code: https://github.com/...                  # optional, rendered as 'Code'
image: /images/publications/your-thumb.jpg
---
{% capture clinical %}**Background**: One-paragraph clinical-tone summary. Avoid heavy jargon. Use **bold** lead-ins for sections like Background, Methods and Results.{% endcapture %}
{% capture technical %}**Motivation**: One-paragraph technical-tone summary. ML/methods/jargon OK. Sections like Motivation, Pipeline, Results work well.{% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>
```

Important conventions:
- **No blank lines** between the capture blocks or the divs (Jekyll's excerpt extractor cuts at the first `\n\n`).
- Use `| markdownify` on the captured content — do **not** use `markdown="1"` on the div (kramdown nests divs incorrectly otherwise).
- For clinical-only posts, omit `title_technical:` and the `{% capture technical %}` block. The post will hide in technical mode.

## Adding/editing news

All news items live in [_data/news.yml](_data/news.yml). Add new items at the top:

```yaml
- date: "Mar'26"
  tag: "[Paper]"
  tag_class: news-tag         # or news-imp-tag for the highlighted variant
  clinical: |-
    Your clinical-toned text. <b>HTML</b> and <a href="...">links</a> work here.
  technical: |-
    Your technical-toned text. Leave as "" to hide from technical mode.
```

Then rebuild (see below). News items with empty `technical: ""` only appear in clinical mode.

## Rebuilding locally

After editing any post, `_data/news.yml`, `_config.yml`, or a layout:
 

## Files involved in the dual-mode system

| File | Role |
|---|---|
| [_config.yml](_config.yml) | `site_mode.default` and URL tokens |
| [_layouts/default.html](_layouts/default.html) | Mode-detection script, CSS visibility rules, post/news loops with `view-*` and `post-has-*` / `item-has-*` classes |
| [_layouts/post.html](_layouts/post.html) | Inherits default; toggle propagates to detail pages |
| [_data/news.yml](_data/news.yml) | All news entries with `clinical:` / `technical:` fields |
| [_posts/](_posts/) | Individual posts; migrated ones use `{% capture %}` blocks + view divs |
