/*
   TableOfContents Plugin for jQuery

   Programmed by Doug Neiner

   Version: 0.8

   Based on code and concept by Janko Jovanovic
   in his article:
   http://www.jankoatwarpspeed.com/post/2009/08/20/Table-of-contents-using-jQuery.aspx

   This plugin is offered under the MIT license:

   (c) 2013 Brandon Philips, http://ifup.org
   (c) 2009 by Doug Neiner, http://dougneiner.com

   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to
   the following conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/


(function ($) {

  $.TableOfContents = function (el, scope, options) {
    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;

    // Access to jQuery and DOM versions of element
    self.$el = $(el);
    self.el = el; 

    self.toc = '';                               // We use this to build our TOC;
    self.listStyle = null;                       // This will store the type of list
    self.tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']; // The six header tags


    self.init = function () {
      // Merge the defaultOptions with any options passed in
      self.options = $.extend({},$.TableOfContents.defaultOptions, options);

      // Gets the scope. Defaults to the entire document if not specified
      if (typeof(scope) == "undefined" || scope == null) scope = document.body;
      self.$scope = $(scope);

      // Find the first heading withing the scope
      var $first = self.$scope.find(self.tags.join(', ')).filter(':first');

      // If no headings were found, stop building the TOC
      if ($first.length != 1) return;

      // Set the starting depth
      self.starting_depth = self.options.startLevel;

      // Quick validation on depth
      if (self.options.depth < 1) self.options.depth = 1;

      // Get only the tags starting with startLevel, and counting the depth
      var filtered_tags = self.tags.splice(self.options.startLevel - 1, self.options.depth);

      // Cache all the headings that match our new filter
      self.$headings = self.$scope.find(filtered_tags.join(', '));


      // If topLinks is enabled, set/get an id for the body element
      if (self.options.topLinks !== false) {
        var id = $(document.body).attr('id');
        if (id == "") {
          id = self.options.topBodyId;
          document.body.id = id;
        };

        // Cache the id locally
        self.topLinkId = id;
      };


      // Find out which list style to use
      if (self.$el.is('ul')) {
        self.listStyle = 'ul';
      } else if (self.$el.is('ol')) {
        self.listStyle = 'ol';
      };


      self.buildTOC();

      if (self.options.proportionateSpacing === true && !self.tieredList()) {
        self.addSpacing();
      };

      return base; // Return this object for memory cleanup
    };

    // Helper function that returns true for both OL and UL lists
    self.tieredList = function () {
      if (self.options.tieredList === false) {
        return false;
      }
      return (self.listStyle == 'ul' || self.listStyle == 'ol');
    };

    self.buildTOC = function () {
      self.current_depth = self.starting_depth;

      self.$headings.each(function (i,element) {
        // Get current depth base on h1, h2, h3, etc.
        var depth = this.nodeName.toLowerCase().substr(1,1);

        // This changes depth, or adds separators, only if not the first item
        if (i > 0 || ( i == 0 && depth != self.current_depth)) {

          self.changeDepth(depth)
        };

        // Add the TOC link
        self.toc += self.formatLink(this, depth, i) + "\n";

        // Add the topLink if enabled
        if (self.options.topLinks !== false) self.addTopLink(this);
      });

      // Close up any nested list
      self.changeDepth(self.starting_depth, true);

      // Wrap entire TOC in an LI if item was nested.
      self.toc = "<li>\n" + self.toc + "</li>\n";

      // Update the TOC element with the completed TOC
      self.$el.html(self.toc);
    };

    self.addTopLink = function (element) {
      // Get the text for the link (if topLinks === true, it defaults to "Top")
      var text = (self.options.topLinks === true ? "Top" : self.options.topLinks );
      var $a = $("<a href='#" + self.topLinkId + "' class='" + self.options.topLinkClass + "'></a>").html(text);

      // Append to the current Header element
      $(element).append($a);
    };

    self.formatLink = function (element, depth, index) {
      // Get the current id of the header element
      var id = element.id,
          text = $(element).text();

      // If no id exisits, create a unique one
      if (id == "") {
        id = self.buildSlug($(element).text());
        element.id = id;
      };

      if (self.options.linkifyHeaders) {
        $(element).empty();
        $(element).append("<a href='#" + id + "'>" + text + "</a>");
      }

      // Start building the a link
      var a = "<a href='#" + id + "'";

      // If this isn't a tiered list, we need to add the depth class
      if (!self.tieredList()) a += " class='" + self.depthClass(depth) + "'";

      // Finish building the link
      a += ">" + self.options.levelText.replace('%', $(element).text()) + '</a>';
      return a;
    };

    self.changeDepth = function (new_depth, last) {
      if (last !== true) last = false;

      // If nested
      if (new_depth > self.current_depth) {
        // Add enough opening tags to step into the heading
        // as it is possible that a poorly built document
        // steps from h1 to h3 without an h2
        var opening_tags = [];
        if (self.tieredList()) {
          for(var i = self.current_depth; i < new_depth; i++) {
            opening_tags.push('<' + self.listStyle + '>' + "\n");
          };
        }
        var li = "<li>\n";

        // Add the code to our TOC and an opening LI
        self.toc += opening_tags.join(li) + li;

      } else if (new_depth < self.current_depth) {
        // Close all the loops
        var closing_tags = [];
        if (self.tieredList()) {
          for(var i = self.current_depth; i > new_depth; i--) {
            closing_tags.push('</' + self.listStyle + '>' + "\n");
          };
        }

        // Add closing LI and any additional closing tags
        self.toc += "</li>\n" + closing_tags.join('</li>' + "\n");

        // Open next block
        if (!last) {
          self.toc += "</li>\n<li>\n";
        }
      } else {
        // Just close a tag and open a new one
        // since the depth has not changed
        if (!last) {
          self.toc += "</li>\n<li>\n";
        }
      };

      // Store the new depth
      self.current_depth = new_depth;
    };

    self.buildSlug = function (text) {
      text = text.toLowerCase().replace(/[^a-z0-9 -]/gi,'').replace(/ /gi,'-');
      text = text.substr(0,50);
      return text;
    };

    self.depthClass = function (depth) {
      // Normalizes the depths to always start at 1, even if the starting tier is a h4
      return self.options.levelClass.replace('%', (depth - ( self.starting_depth - 1 ) ) );
    };

    self.addSpacing = function () {
      var start = self.$headings.filter(':first').position().top;

      self.$headings.each(function (i,el) {
        var $a = self.$el.find('a:eq(' + i + ')');
                               var pos = (
                                          ( $(this).position().top - start ) / 
                                          ( self.$scope.height()   - start )
                                         ) * self.$el.height();
                               $a.css({
                                 position: "absolute",
                                 top: pos
                               });
                               });
        };

        return self.init();
        };


        $.TableOfContents.defaultOptions = {
          // One option is set by the container element, and not by changing
          // a setting here. That is the type of TOC to output. For a nested ordered list
          // make sure your wrapping element is an <ol>. For a nested bulleted list
          // make sure your wrapping element is an <ul>. For a straight outputting of links
          // use any other element.

          // Which H tags should be the root items. h1 = 1, h2 = 2, etc.
          startLevel: 1,

          // How many levels of H tags should be shown, including the startLevel
          // startLevel: 1, depth: 3 = h1, h2, h3
          // startLevel: 2, depth: 3 = h2, h3, h4
          depth: 3,

          // Don't nest ul/ol lists
          tieredList: true,

          // Each link in a straight set is give a class designating how deep it is. 
          // You can change the class by changing this option,
          // but you must include a % sign where you want the number to go.
          // Nested lists do not add classes, as you can determine their depth with straight css
          levelClass: "toc-depth-%",

          // When each link is formed, you can supply additional html or text to be formatted
          // with the text of the header. % represents the text of the header
          levelText: "%",

          // This plugin can add "To Top" links to each header element if you want.
          // Set topLinks to true to use the text "Top" or set it to some text or html
          // content you wish to use as the body of the link
          topLinks: false,

          // Linkify the headers as they are added to the Table of Contents
          linkifyHeaders: true,

          // If topLinks is either true or a text/html value, you can also set the following options:

          // Class of the link that is added to the headers
          topLinkClass: "toc-top-link",

          // Which class should be added to the body element if it does not
          // already have an id associated with it
          topBodyId: "toc-top",

          // To have the TOC spaced proportionatly to the spacing of the headings,
          // you must have a fixed height on the TOC wrapper, and it must "haveLayout"
          // either position = fixed | absolute | relative
          // Finally, the TOC wrapper must not be a UL or an LI or this setting will
          // have no effect
          proportionateSpacing: false

        };


        $.fn.tableOfContents = function (scope, options) {
          return this.each(function () {
            var toc = new $.TableOfContents(this, scope, options);
            delete toc; // Free memory
            $('[data-spy="scroll"]').each(function () {
                var $spy = $(this).scrollspy('refresh')
            });
          });
        };
})(jQuery);


$(document).ready(function () {
  $("ul#toc").tableOfContents(null, {
    startLevel: 2,
    tieredList: false
  });
})
