# Fixie Docs

> Transform your markdown documentation into a single navigable html
> document.

<iframe width="560" height="315" src="http://www.youtube.com/embed/YsZijEx2Iyo?hd=1" frameborder="0" allowfullscreen></iframe>

This tool takes a single markdown input file, named README.md by
convention, and turns it into a single html page. The target audience
are people writing reference documentation for products, APIs or
libraries. It was written as a reaction to complex tools and inspired by
single page docs like [express][express].

Notable features:

- Single input file
- Auto-refresh on edits
- Generated navigation
- Simple build system
- Open source (MIT)

Give it a shot and let me know what you think.

[express]: http://expressjs.com/api.html

## Usage

Get started by downloading the code and dependencies. This step you
will only need to run once.

```
git clone https://github.com/philips/fixiedocs.git
cd fixiedocs
npm install
```

Now the fun part: getting a preview of the document. In the same
terminal run the following command to launch a server and open your
browser.

```
grunt server
```

This browser preview will continue to update everytime you save a change
to the README.md file. Lets try that out. Open the README.md file in
your favorite editor and start editing. If you aren't familiar with
markdown you can find a [full guide here][markdown]. But, you should be
able to infer the basics from reading the Fixie Docs README.md file.

[upstream]: https://github.com/philips/fixiedocs
[markdown]: http://daringfireball.net/projects/markdown/

## Publishing

In most every case documentation is meant to be uploaded for anyone to
read on the public internet. So, lets setup a nice automated process for
generating your website on a public URL.

Let's use GitHub's free static HTML hosting called [Pages][pages]. We
will generate the Pages when we commit a change to this git repo using
Travis CI. It will be nice and automated.

```
yo travis-ci:gh-pages
```

[pages]: http://pages.github.com/

By default you should have a beautiful set of docs. However, you can
customize the CSS, JavaScript and HTML too. All of it can be found in
the `app/` directory.

For example the HTML template will need to be customized if you wish to
add a title or analytics. The template file is called
`app/template.jst`.

To generate an uploadable static version of the docs locally run the `grunt`
command in your terminal.  This will output all of the necessary HTML, CSS and
JavaScript to the `dist/` directory.

There are a ton of other great options for publishing the static
documentation that is generated from Fixie Docs. Here are a few
suggestions:

- [Amazon S3][s3]
- [Google Storage][gs]
- [Rackspace Cloud Files][cf]

[s3]: http://stackoverflow.com/questions/8312162/static-hosting-on-amazon-s3-dns-configuration
[gs]: https://developers.google.com/storage/docs/gsutil/commands/setwebcfg
[cf]: http://www.rackspace.com/blog/rackspace-cloud-files-how-to-create-a-static-website/

## Future Directions

There are a lot of features I would love to see. Here are some of them.

- Extract code snippets into individual files for testing
- Integrate the frontend code into jekyll
- Improved responsive layouts
- Better packaging
- Use lunr to integrate filtering and searching: https://npmjs.org/package/lunr
- Heirarchy in the sidebar like express js
