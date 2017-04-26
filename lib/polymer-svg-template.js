'use strict';

window.PolymerSvgTemplate = function templateInSvg(name) {
  var ua = window.navigator.userAgent;

  // IE10-11 does not need this fix.
  if (/MSIE /.test(ua) || /Trident\//.test(ua)) {
    return;
  }

  // owner document of this import module
  var doc = window.currentImport;
  var ns = doc.body.namespaceURI;

  var template = Polymer.DomModule.import(name, 'template');
  if (template) {
    walkTemplate(template._content || template.content);
  }

  function upgradeTemplate(el) {
    var tmpl = el.ownerDocument.createElement('template');
    el.parentNode.insertBefore(tmpl, el);
    var attribs = el.attributes;
    var count = attribs.length;
    var child = void 0;
    while (count-- > 0) {
      var attrib = attribs[count];
      tmpl.setAttribute(attrib.name, attrib.value);
      el.removeAttribute(attrib.name);
    }
    el.parentNode.removeChild(el);
    var content = tmpl.content;
    while (child = el.firstChild) {
      content.appendChild(child);
    }
    return tmpl;
  }

  function walkTemplate(root) {
    var treeWalker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, { acceptNode: function acceptNode(node) {
        return NodeFilter.FILTER_ACCEPT;
      } }, false);
    var nodeList = [],
        node = void 0;
    while (treeWalker.nextNode()) {
      node = treeWalker.currentNode;
      if (node.localName === 'svg') {
        walkTemplate(node);
      } else if (node.localName === 'template' && !node.hasAttribute('preserve-content') && node.namespaceURI !== ns) {
        node = upgradeTemplate(node);
        walkTemplate(node._content || node.content);
        treeWalker.currentNode = node;
      }
    }
  }
};