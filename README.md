# elplato
> An insanely fast client-side templating language

elplato uses `createElement` statements to render templates in the browser up to **4 times faster** than [doT] and [Handlebars].

## Example

elplato's syntax is simply HTML with a few special elements and attribute prefixes thrown in, with Mustache-like syntax for variable substitution.

```html
<div>
  <h1>Category: {{category}}</h1>
    <if items.length>
      <ul>
        <foreach items>
          <li>
            <h2>{{parent.category}}: {{name}}</h2>
            <h3 if-sale='class="sale"'>{{price}}</h3>
            <h3>{{stockCount}} in stock</h3>
            <button unless-stockCount='disabled="disabled"'>Buy now</button>
          </li>
        </foreach>
      </ul>
    <else>
      <p>This category is empty.</p>
    </if>
</div>
```

Calling a compiled template returns the HTML root element, if the template has a single element.

```js
var div = template({
  category: 'Main Courses',
  items: [
    {
      name: 'Spicy Steak Tacos',
      sale: true,
      price: '$5.00',
      stockCount: 100
    }
  ]
});

document.body.appendChild(div);
```

## Syntax

### `{{variable}}`

Variables can be substituted using double braces. HTML in variables is always escaped.

```html
<button class="{{class}}">{{text}}</button>
```

### `<if var>`

Evaluate the contained HTML if `var` is truthy.

```html
<if enabled>
  It's enabled!
</if>
```

### `<unless var>`

Evaluate the contained HTML if `var` is falsey.

```html
<unless enabled>
  It's disabled!
</unless>
```

### `<else>`

Used with `<if>` and `<unless>`, evaluated if the opposite is true.

```html
<if enabled>
  It's enabled!
<else>
  It's disabled!
</if>
```

### `<foreach array[,iterator]>`

Iterate over the items in `array`. `this` becomes the value and its properties can be accessed without dot notation.

If `iterator` is provided, `{{iterator}}` will be set to the index of the current item.

#### Data
```json
{
  "name": "Spicy Steak Tacos",
  "tags": ["hot", "fresh", "new"]
}
```

#### Template
```html
<h1>{{name}}</h1>
<ul>
  <foreach tags,num>
    <li>{{num}}. {{this}}</li>
  </foreach>
</ul>
```

#### Output
```html
<h1>Item</h1>
<ul>
  <li>0. hot</li>
  <li>1. fresh</li>
  <li>2. new</li>
</ul>
```

### `<forin object[,prop]>`

Iterate over the properties of `object`. `this` becomes the value and its properties can be accessed without dot notation.


#### Data
```json
{
  "name": "Spicy Steak Tacos",
  "stats": {
    "Spice level": "hot",
    "Vegetarian": "No",
    "Rating": "5"
  }
}
```

#### Template
```html
<h1>{{name}}</h1>
<ul>
  <forin stats,stat>
    <li>{{stat}}: {{this}}</li>
  </forin>
</ul>
```

#### Output
```html
<h1>Taco</h1>
<ul>
  <li>Spice level: Hot</li>
  <li>Vegetarian: No</li>
  <li>Rating: 5</li>
</ul>
```

If `prop` is provided, `{{prop}}` will be set to the property name.

### `<div if-var='attr="value"'>`

Conditionally sets the `attr` attribute to `value` if `var` is truthy.

Use space to separate multiple attributes.

```html
<button if-disabled='disabled="disabled" class="disabled"'>Buy</button>
```

### `<div unless-var='attr="value"'>`

Conditionally  sets the `attr` attribute to `value` attributes if `var` is falsey.

Use space to separate multiple attributes.

```html
<button unless-disabled='class="enabled"'>Buy</button>
```

### `<js>`

Evaluates the content in place. `data` will be set to the current data object and can be mutated or re-assigned.

```html
<js>
var i = 10;
while (i-- > 0) {
  data.count = i;
</js>
  <span>{{count}}</span>
<js>
}
</js>
```

### `handle="handleName"`

If the `handle` attribute is present on any elements in the template, a reference to the element will be assigned as `this.handleName`.

#### Template
```html
<h1 handle="heading">{{heading}}</h1>
<p handle="content">{{content}}</h1>
```

#### Usage
```js
var obj = {
  template: template
};

// Since obj is to the left of the dot, this === obj
obj.template({
  heading: 'This is the heading',
  content: 'This is the content'
});

// Since handle was present, we have references to the elements
obj.heading.textContent = 'A new heading';
obj.content.textContent = 'Some new content';
```

If a handle name begins with `$`, a jQuery object will be stored:

#### Template
```html
<h1 handle="$heading">{{heading}}</h1>
<p handle="$content">{{content}}</h1>
```

#### Usage
```js
var view = {
  template: template
};

view.template({
  heading: 'This is the heading',
  content: 'This is the content'
});

// Since the handle name started with $, we have references to the jQuery objects
view.$heading.text('A new heading');
view.$content.text('Some new content');

// Plain HTMLElements are still available
view.heading.textContent = 'A new heading';
view.content.textContent = 'Some new content';
```

Of course, you can always use [`Function.call`][Function.call] to change the context of execution and get the same result:

```js
var view = {};

template.call(view, {
  heading: 'This is the heading',
  content: 'This is the content'
});
```


## Template precompilation

As elplato parses HTML to generate `createElement` statements, and as such, it only makes sense if precompiled. You cannot compile elplato templates in the browser.

Use [`grunt-elplato`][grunt-elplato] or [`gulp-elplato`][gulp-elplato] to precompile your templates.

Alternatively, yhe Node module exports a function that takes template code and options. It returns a function you can serialize and make available for client-side execution however you see fit.

### Precompilation
```js
var compile = require('elplato');
var fs = require('fs');

var template = compile('<p>My template is {{adjective}}!</p>', { stripWhitespace: true });

fs.writeFileSync('template.js', 'var template = '+template.toString()+';');
```

### Usage
```html
<script src="template.js"></script>
<script>
  document.body.appendChild(template({ adjective: 'awesome' }));
</script>
```


## Compiler options

The compiler takes the following options:


#### stripWhitespace
Type: `Boolean`  
Default: `false`

If `true`, meaningless whitespace will be stripped. This provides a large performance boost as less meaningless `createTextNode` calls are created.

**Warning:** Meaningful whitespace, such as space between inline tags, will be preserved. However, if your CSS gives `display: inline` to block elements, whitespace between those elements will still be stripped.


#### debug
Type: `Boolean`  
Default: `false`

Dump debug data, including the source file, parsed tree, and compiled function body.


## Running the benchmarks

elplato comes with a set of benchmarks that use karma-benchmark to test real-world browser performance.

```
npm install
grunt bench
```


## Running the test suite

elplato is tested with mocha, chai, and jsdom.

```
npm install
grunt test
```

[Function.call]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
[grunt-elplato]: http://github.com/lazd/grunt-elplato
[gulp-elplato]: http://github.com/lazd/gulp-elplato
[doT]: http://olado.github.io/doT/index.html
[Handlebars]: http://handlebarsjs.com/
