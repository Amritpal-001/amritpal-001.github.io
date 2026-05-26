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



# improvmeents
- Replace website by "paper"
- Add pdfs locally
- Add education/work experience at bottom
- Add authors for each paper



title_technical: "Cox-based retinal vasculature biomarker model for 10-year incident prediction"
{% capture clinical %}

{% endcapture %}
{% capture technical %}**Motivation**: Hematological malignancies exhibit chronic-inflammation-driven microvascular remodeling. We hypothesized that retinal fundus imaging — a non-invasive, high-resolution proxy for systemic microvasculature — encodes pre-symptomatic disease signal extractable via deep-learning-derived vasculature features.
{% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>
