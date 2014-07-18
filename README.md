# DOMly [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis]
> The fast template system that creates and clones DOM nodes
<img src="http://i.imgur.com/kWjdMgE.png" align="right" alt="DOMly logo">

DOMly uses `cloneNode` and `createElement` to render templates in the browser up to **7 times faster** than [doT] and [Handlebars].

DOMly is named after [Dolly the sheep][Dolly], the first mammal to be cloned.


## Example

DOMly's syntax is simply HTML with a few special tags and attribute prefixes thrown in and Mustache-like syntax for variable substitution / method invocation.

```html
<div>
  <h1>Category: {{data.category}}</h1>
    <if data.items.length>
      <ul>
        <foreach data.items>
          <li>
            <h2>{{parent.category}}: {{data.name}}</h2>
            <h3 if-data.sale='class="sale"'>{{data.rice}}</h3>
            <h3>{{formatCount(data.stockCount)}} in stock</h3>
            <button unless-data.stockCount='disabled="disabled"'>Buy now</button>
          </li>
        </foreach>
      </ul>
    <else>
      <p>This category is empty.</p>
    </if>
</div>
```

Calling a compiled template returns the the root [Node] or [DocumentFragment], ready to be added to the DOM:

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

// Add the node to the DOM
document.body.appendChild(div);
```


## Available variables

### `data`

`data` refers to the current data context as passed to the template. If within a `<foreach>` or `<forin>` loop, `data` refers to the current item.

### `parent`

When within a `<foreach>` or `<forin>` loop, `parent` refers to the data context outside of the loop. This can be chained, resulting in `parent.parent` referring to the data context outside of two nested loops.

### `this`

`this` refers to the value of `this` when executing the template function.

The initial value of `this` when executing a template is whatever is to the left of the dot:

```
var obj = {
  template: template
};

// this is obj
obj.template();
```

You can change the value of `this` when executing template function by using [`Function.prototype.call`](Function.prototype.call) or [`Function.prototype.bind`](Function.prototype.bind):

```js
var obj = {
  method: function() {
    return 'Available as this.method()';
  },
  property: 'Available as this.property'
};

var templateData = {
  property: 'Available as this.data'
};

// Render the template with obj as this and templateData as data
var fragment = template.call(obj, data);
```


### `someGlobalVariable`

All global variables and functions are available within templates.

As properties of the data context and `this` object must be preceded by `data` and `this` respectively, there is no possibility of accidentally using a global variable.


### `someIterator`

An iterator variable, as declared when using `<foreach>` or `<forin>` with a named iterator.

Iterators supersede global variables, so you will not be able to access any globals with the same name as an iterator used anywhere in the template.

### Statements

Statements take the same form as JavaScript statements, except spaces are not allowed.

Note: Expressions are not currently supported within statements. As such, statements cannot contain `&&`, `||`, `+`, etc.


### `variable`

Variables can be used as the return value of a statement.

* `data` - Substitute the current data context directly
* `data.myProperty` - Substitute a property of the current data context
* `this.myProperty` - Substitute with a property of this
* `myGlobalVariable` - Substitute a global variable
* `myGlobalObject.myProperty` - Substitute a property of a globally accessible object


### `method()`

Methods can be invoked as part of a statement.

* `data.myMethod()` - Invoke a method of the current data context
* `parent.myMethod()` - Invoke a method of the parent data context
* `this.myMethod()` - Invoke a method on this
* `myGlobalFunction()` - Invoke a globally accessible function
* `myGlobalObject.myMethod()` - Invoke a method of a globally accessible object

Invoked methods can be passed any arbitrary arguments. For instance:

```
myMethod(globalFunc(data.dataProp),parent.parentProp,this.thisProp,globalVariable,globalObject.prop)
```

The above statement would invoke `myMethod` with the following:

* The return value of the global function `globalFunc` when passed the current data context's `myDateProp` property
* The value of the parent data context's `myParentProp` property
* The value of `this`'s `myScopeProp` property
* The value of the global variable `myGlobalVariable`
* The value of the `myProp` property of the globally accessible object, `myGlobalObject`


## Substitutions

### `{{statement}}`

Substitute the return value of `statement` into the DOM as text.

Substitutions can be made in attribute values or text content:

```html
<button class="{{data.className}}">{{data.label}}</button>
```

Substitutions are always escaped. **It is impossible to inject HTML.**


## Syntax


### `<if statement>`

Include the contained elements if `statement` is truthy.

#### If the value of a data context property is truthy

In this example, we simply test the current data context's `enabled` property for truthiness, adding the `<p>` to the DOM if it's truthy.

```html
<if data.enabled>
  <p>{{data.name}} is enabled!</p>
</if>
```

#### If the return value of a method is truthy

In this example, the method `passesTest` is a method of `this`. We'll pass the current data context to it, and, if `passesTest` returns a truthy value, we'll add the `<p>` to the DOM.

```html
<if this.passesTest(data)>
  <p>{{data.name}} passes the test!</p>
</if>
```


### `<unless statement>`

The opposite of `<if statement>`.


### `<else>`

Used with `<if>` and `<unless>`, evaluated if the statement is falsey.

```html
<if data.enabled>
  <p>{{data.name}} is enabled!</p>
<else>
  <p>{{data.name}} is disabled.</p>
</if>
```


### `<foreach statement[,iterator]>`

Iterate over the items the of the array returned by `statement`. The item is available as `data`.

If `iterator` is provided, the index of the current item will be available as `{{iterator}}` for substitution and `iterator` for method invocation.

#### Data
```json
{
  "tags": ["hot", "fresh", "new"]
}
```

#### Template
```html
<ul>
  <foreach data.tags,tagNumber>
    <li>{{tagNumber}}. {{data}}</li>
  </foreach>
</ul>
```

#### Output
```html
<ul>
  <li>0. hot</li>
  <li>1. fresh</li>
  <li>2. new</li>
</ul>
```


### `<forin statement[,prop]>`

Iterate over the properties of `object`. The value is available as `data`.

If `prop` is provided, the property name will be available as `{{prop}}` for substitution and `prop` for method invocation.


#### Data
```json
{
  "stats": {
    "Spice level": "hot",
    "Vegetarian": "No",
    "Rating": "5"
  }
}
```


#### Template
```html
<ul>
  <forin data.stats,stat>
    <li>{{stat}}: {{data}}</li>
  </forin>
</ul>
```


#### Output
```html
<ul>
  <li>Spice level: Hot</li>
  <li>Vegetarian: No</li>
  <li>Rating: 5</li>
</ul>
```


### `<div if-statement='attr="value"'>`

Conditionally sets the `attr` attribute to `value` if the return value of `statement` is truthy.

Use space to separate multiple attributes.

```html
<button if-data.disabled='disabled="disabled" class="disabled"'>Buy</button>
```

Attributes can contain substitutions as well:

```html
<button if-data.customAttr='{{customAttr.name}}={{customAttr.value}}'>Buy</button>
```


### `<div unless-statement='attr="value"'>`

The opposite of `<div if-statement='attr="value"'>`.


### `<partial statement><partial>`

Insert the returned [DocumentFragment] or [Node] into the DOM.

If no arguments are passed, the current data context will be passed.


### `<helper statement>{{statement}} text</helper>`

Insert the returned string as text content.

If `statement` is a function call, the text content inside of the `<helper>` tag will be evaluated and passed as the last argument.


### `<js>`

Evaluates the content in place. `data` will be set to the current data object and can be mutated or re-assigned.

```html
<js>
var i = 10;
while (i-- > 0) {
  data.count = i;
</js>
  <span>{{data.count}}</span>
<js>
}
</js>
```


### `handle="handleName"`

If the `handle` attribute is present on any elements in the template, a reference to the element will be assigned as `this.handleName`.

Statements can also be used within handle names.

#### Template

```html
<ul handle="list">
  <foreach data.tags,itemNum>
    <li handle="item_{{itemNum}}">{{data}}</li>
  </foreach>
</ul>
```

#### Usage
```js
// An object we'll use as the value of this
var obj = {};

// Data for the template
var templateData = {
  name: 'MainList',
  tags: [
    'Tag 1',
    'Tag 2'
  ]
};

// Render the template with obj as this and templateData as data
template.call(obj, templateData);

// For handle names that start with $, references to the jQuery object are available
view.item_0.innerHTML = 'A new Tag 1';
view.item_1.innerHTML = 'A new Tag 2';
```

If a handle name begins with `$`, such as `$handle`, a jQuery object will be stored as `$handle` and the Node itself will be stored as `handle`. This is accomplished by passing the node to `$`, so you can use your own `$` function instead of jQuery.


## Template precompilation

DOMly parses HTML to generate `createElement` statements, and as such, it only makes sense if precompiled.

**You cannot compile DOMly templates in the browser.** Use [`grunt-domly`][grunt-domly] or [`gulp-domly`][gulp-domly] to precompile your templates.

Alternatively, the `domly` Node module can be used to precompile templates.

### domly.precompile(template[, options])

Takes a template string and returns a string of JavaScript code.

#### template
Type: `String`

The template to compile.

#### options.stripWhitespace
Type: `Boolean`  
Default: `false`

If `true`, meaningless whitespace will be stripped. This provides a large performance boost as less meaningless `createTextNode` calls are created.

**Warning:** Meaningful whitespace, such as space between inline tags, will be preserved. However, if your CSS gives `display: inline` to block elements, whitespace between those elements will still be stripped.

#### options.debug
Type: `Boolean`  
Default: `false`

Dump debug data, including the source file, parsed tree, and compiled function body.

#### options.noFrags
Type: `Boolean`  
Default: `false`

Don't create templates that immediately cache `DocumentFragment` objects. This is useful for web components where you don't want the `createdCallback` to be executed during template declaration.

#### options.preserveHandleAttr
Type: `Boolean`  
Default: `false`

Leave the `handle` attribute intact. By default, the `handle` attribute will not be added to the created elements.

#### options.appendClassNames
Type: `Boolean`  
Default: `false`

Append the contents of the `class` attribute value to the existing `className` property. This is useful when your web component sets its className in `createdCallback`.

#### options.preserveComments
Type: `Boolean`  
Default: `false`

Leave comment nodes intact in the rendered template. By default, comment nodes will not be included.


### Example
```js
var domly = require('domly');
var fs = require('fs');

// Precompile returns a string of JS code
var template = domly.precompile('<p>My template is {{data.adjective}}!</p>', {
  stripWhitespace: true // Strip whitespace for better performance
});

fs.writeFileSync('template.js', 'var awesomeTemplate = '+template.toString()+';');
```

#### Usage
```html
<script src="template.js"></script>
<script>
  document.body.appendChild(awesomeTemplate({ adjective: 'awesome' }));
</script>
```

## Running the benchmarks

DOMly comes with a set of benchmarks that use karma-benchmark to test real-world browser performance.

```
npm install
bower install
grunt bench
```


## Running the test suite

DOMly is tested with mocha, chai, sinon, and jsdom.

```
npm install
grunt test
```


## License

DOMly is licensed MIT.


[Node]: https://developer.mozilla.org/en-US/docs/Web/API/Node
[DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
[Function.prototype.call]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
[Function.prototype.bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
[grunt-domly]: http://github.com/lazd/grunt-domly
[gulp-domly]: http://github.com/lazd/gulp-domly
[doT]: http://olado.github.io/doT/index.html
[Handlebars]: http://handlebarsjs.com/

[Dolly]: http://en.wikipedia.org/wiki/Dolly_(sheep)
[Logo]: http://www.clker.com/clipart-schaap.html

[coveralls]: https://coveralls.io/r/lazd/DOMly
[coveralls-image]: https://coveralls.io/repos/lazd/DOMly/badge.png?branch=master

[travis]: http://travis-ci.org/lazd/DOMly
[travis-image]: https://secure.travis-ci.org/lazd/DOMly.png?branch=master

[npm-url]: https://npmjs.org/package/domly
[npm-image]: https://badge.fury.io/js/domly.png